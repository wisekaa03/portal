/** @format */

//#region Imports NPM
import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import Ldap from 'ldapjs';
import { EventEmitter } from 'events';
import * as cacheManager from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import bcrypt from 'bcrypt';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import dayjs from 'dayjs';
import {
  LDAP_OPTIONS,
  LdapModuleOptions,
  LDAPCache,
  LdapResponseUser,
  ldapADattributes,
  LdapResponseGroup,
  LDAPAddEntry,
} from './ldap.interface';
import { Change } from './ldap/change';
//#endregion

@Injectable()
export class LdapService extends EventEmitter {
  private clientOpts: Ldap.ClientOptions;

  private bindDN: string;

  private bindCredentials: string;

  private adminClient: Ldap.Client;

  private adminBound: boolean;

  private userClient: Ldap.Client;

  private getGroups: (user: Ldap.SearchEntryObject) => Promise<Ldap.SearchEntryObject>;

  private userCacheStore: cacheManager.Store;

  private userCache: cacheManager.Cache;

  private salt: string;

  private ttl: number;

  /**
   * Create an LDAP class.
   *
   * @param {LdapModuleOptions} opts Config options
   * @param {LogService} logger Logger service
   * @param {ConfigService} configService Config service
   * @constructor
   */
  constructor(
    @Inject(LDAP_OPTIONS) private readonly options: LdapModuleOptions,
    @InjectPinoLogger(LdapService.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    super();

    if (options.cache) {
      this.ttl = configService.get<number>('LDAP_REDIS_TTL');
      this.salt = bcrypt.genSaltSync(10);

      this.userCacheStore = redisStore.create({
        // A string used to prefix all used keys (e.g. namespace:test).
        // Please be aware that the keys command will not be prefixed.
        prefix: 'LDAP',
        url: configService.get<string>('LDAP_REDIS_URI'), // IP address of the Redis server
        // If set, client will run Redis auth command on connect.
        // path - The UNIX socket string of the Redis server
        // url - The URL of the Redis server.
        // string_numbers
        // return_buffers
        // detect_buffers
        // socket_keepalive
        // socket_initialdelay
        // no_ready_check
        // enable_offline_queue
        // retry_max_delay
        // connect_timeout
        // max_attempts
        // retry_unfulfilled_commands
        // family - IPv4
        // disable_resubscribing
        // rename_commands
        // tls
        // prefix
        // retry_strategy
      });

      this.userCache = cacheManager.caching({
        store: this.userCacheStore,
        ttl: this.ttl,
        // max: configService.get<number>('LDAP_REDIS_MAX'),
      });

      this.logger.debug('Redis connection: success');
    }

    this.clientOpts = {
      url: options.url,
      tlsOptions: options.tlsOptions,
      socketPath: options.socketPath,
      log: options.logger,
      timeout: options.timeout || 5000,
      connectTimeout: options.connectTimeout || 5000,
      idleTimeout: options.idleTimeout || 5000,
      reconnect: options.reconnect || true,
      strictDN: options.strictDN,
      queueSize: options.queueSize || 200,
      queueTimeout: options.queueTimeout || 5000,
      queueDisable: options.queueDisable || false,
    };

    this.bindDN = options.bindDN;
    this.bindCredentials = options.bindCredentials;

    this.adminClient = Ldap.createClient(this.clientOpts);
    this.adminBound = false;
    this.userClient = Ldap.createClient(this.clientOpts);

    this.adminClient.on('connectError', this.handleConnectError.bind(this));
    this.userClient.on('connectError', this.handleConnectError.bind(this));

    this.adminClient.on('error', this.handleErrorAdmin.bind(this));
    this.userClient.on('error', this.handleErrorUser.bind(this));

    if (options.reconnect) {
      this.once('installReconnectListener', () => {
        this.logger.info('install reconnect listener');
        this.adminClient.on('connect', () => this.onConnectAdmin());
      });
    }

    this.adminClient.on('connectTimeout', this.handleErrorAdmin.bind(this));
    this.userClient.on('connectTimeout', this.handleErrorUser.bind(this));

    if (options.groupSearchBase && options.groupSearchFilter) {
      if (typeof options.groupSearchFilter === 'string') {
        const { groupSearchFilter } = options;
        // eslint-disable-next-line no-param-reassign
        options.groupSearchFilter = (user: Ldap.SearchEntryObject): string => {
          return groupSearchFilter
            .replace(
              /{{dn}}/g,
              (options.groupDnProperty && (user[options.groupDnProperty] as string))
                ?.replace(/\(/, '\\(')
                ?.replace(/\)/, '\\)') || 'undefined',
            )
            .replace(/{{username}}/g, user.sAMAccountName as string);
        };
      }

      this.getGroups = this.findGroups;
    } else {
      // Assign an async identity function so there is no need to branch
      // the authenticate function to have cache set up.
      this.getGroups = async (user) => user;
    }
  }

  /**
   * Format a GUID
   *
   * @public
   * @param {string} objectGUID GUID in Active Directory notation
   * @returns {string} string GUID
   */
  GUIDtoString = (objectGUID: string): string =>
    (objectGUID &&
      Buffer.from(objectGUID, 'base64')
        .toString('hex')
        .replace(
          /^(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)$/,
          '$4$3$2$1-$6$5-$8$7-$10$9-$16$15$14$13$12$11',
        )
        .toUpperCase()) ||
    '';

  /**
   * Mark admin client unbound so reconnect works as expected and re-emit the error
   *
   * @private
   * @param {Ldap.Error} error The error to be logged and emitted
   * @returns {void}
   */
  private handleErrorAdmin(error: Ldap.Error): void {
    if (`${error.code}` !== 'ECONNRESET') {
      this.logger.error(`admin emitted error: [${error.code}]`, error);
    }
    this.adminBound = false;
  }

  /**
   * Mark user client unbound so reconnect works as expected and re-emit the error
   *
   * @private
   * @param {Ldap.Error} error The error to be logged and emitted
   * @returns {void}
   */
  private handleErrorUser(error: Ldap.Error): void {
    if (`${error.code}` !== 'ECONNRESET') {
      this.logger.error(`user emitted error: [${error.code}]`, error);
    }
    // this.adminBound = false;
  }

  /**
   * Connect error handler
   *
   * @private
   * @param {Ldap.Error} error The error to be logged and emitted
   * @returns {void}
   */
  private handleConnectError(error: Ldap.Error): void {
    this.logger.error(`emitted error: [${error.code}]`, error);
  }

  /**
   * Bind adminClient to the admin user on connect
   *
   * @async
   * @private
   * @returns {boolean | Error}
   */
  private async onConnectAdmin(): Promise<boolean> {
    // Anonymous binding
    if (typeof this.bindDN === 'undefined' || this.bindDN === null) {
      this.adminBound = false;

      throw new Error('bindDN is undefined');
    }

    this.logger.info(`bind: ${this.bindDN} ...`);

    return new Promise<boolean>((resolve, reject) =>
      this.adminClient.bind(this.bindDN, this.bindCredentials, (error) => {
        if (error) {
          const message = error.toString();
          this.logger.error(`bind error: ${message}`, message);
          this.adminBound = false;

          return reject(message);
        }

        this.logger.info('bind ok');
        this.adminBound = true;
        if (this.options.reconnect) {
          this.emit('installReconnectListener');
        }

        return resolve(true);
      }),
    );
  }

  /**
   * Ensure that `this.adminClient` is bound.
   *
   * @private
   * @returns {boolean | Error}
   */
  private adminBind = async (): Promise<boolean> => (this.adminBound ? true : this.onConnectAdmin());

  /**
   * Conduct a search using the admin client. Used for fetching both
   * user and group information.
   *
   * @private
   * @param {string} searchBase LDAP search base
   * @param {Object} options LDAP search options
   * @param {string} options.filter LDAP search filter
   * @param {string} options.scope LDAP search scope
   * @param {(string[]|undefined)} options.attributes Attributes to fetch
   * @returns {undefined | Ldap.SearchEntryObject[]}
   * @throws {Error}
   */
  private async search(searchBase: string, options: Ldap.SearchOptions): Promise<undefined | Ldap.SearchEntryObject[]> {
    return this.adminBind().then(
      () =>
        new Promise<undefined | Ldap.SearchEntryObject[]>((resolve, reject) => {
          return this.adminClient.search(
            searchBase,
            options,
            (searchError: Ldap.Error | null, searchResult: Ldap.SearchCallbackResponse) => {
              if (searchError !== null) {
                return reject(searchError.message);
              }
              if (typeof searchResult !== 'object') {
                return reject(`The LDAP server has empty search: ${searchBase}, options=${JSON.stringify(options)}`);
              }

              const items: Ldap.SearchEntryObject[] = [];
              searchResult.on('searchEntry', (entry: Ldap.SearchEntry) => {
                const object: Ldap.SearchEntryObject = Object.keys(entry.object).reduce((o, k: string) => {
                  let key = k;
                  if (k.endsWith(';binary')) {
                    key = k.replace(/;binary$/, '');
                  }
                  switch (key) {
                    case 'objectGUID':
                      return { ...o, [key]: this.GUIDtoString(entry.object[k] as string) };
                    case 'dn':
                      return { ...o, [key]: (entry.object[k] as string).toLowerCase() };
                    case 'sAMAccountName':
                      return { ...o, [key]: (entry.object[k] as string).toLowerCase() };
                    case 'whenCreated':
                    case 'whenChanged':
                      return {
                        ...o,
                        [key]: dayjs((entry.object[k] as string).replace(/\.0Z/, ''), {
                          format: 'YYYYMMDDHHmmssSSSS',
                        }).format('YYYY-MM-DD HH:mm:ss'),
                      };
                    default:
                  }
                  // 'thumbnailPhoto' and 'jpegPhoto' is falling there
                  return { ...o, [key]: entry.object[k] };
                }, {} as Ldap.SearchEntryObject);

                items.push(object);

                if (this.options.includeRaw === true) {
                  items[items.length - 1].raw = (entry.raw as unknown) as string;
                }
              });

              searchResult.on('error', (error: Ldap.Error) => {
                reject(error.message);
              });

              searchResult.on('end', (result: Ldap.LDAPResult) => {
                if (result.status !== 0) {
                  return reject(`non-zero status from LDAP search: ${result.status}`);
                }

                return resolve(items);
              });

              // eslint-disable-next-line unicorn/no-useless-undefined
              return undefined;
            },
          );
        }),
    );
  }

  /**
   * Sanitize LDAP special characters from input
   *
   * {@link https://tools.ietf.org/search/rfc4515#section-3}
   *
   * @private
   * @param {string} input String to sanitize
   * @returns {string} Sanitized string
   */
  private sanitizeInput(input: string): string {
    return input
      .replace(/\*/g, '\\2a')
      .replace(/\(/g, '\\28')
      .replace(/\)/g, '\\29')
      .replace(/\\/g, '\\5c')
      .replace(/\0/g, '\\00')
      .replace(/\//g, '\\2f');
  }

  /**
   * Find the user record for the given username.
   *
   * @private
   * @param {string} username Username to search for
   * @returns {undefined} If user is not found but no error happened, result is undefined.
   * @throws {Error}
   */
  private async findUser(username: string, cache = true): Promise<undefined | Ldap.SearchEntryObject> {
    if (!username) {
      throw new Error('empty username');
    }

    if (cache && this.userCache) {
      // Check cache. 'cached' is `{user: <user>}`.
      const cached: LDAPCache = await this.userCache.get<LDAPCache>(username);
      if (cached && cached.user && cached.user.sAMAccountName) {
        this.logger.debug(`From cache: ${cached.user.sAMAccountName}`);

        return (cached.user as unknown) as Ldap.SearchEntryObject;
      }
    }

    const searchFilter = this.options.searchFilter.replace(/{{username}}/g, this.sanitizeInput(username));
    const options = {
      filter: searchFilter,
      scope: this.options.searchScope,
      attributes: ldapADattributes,
      timeLimit: this.options.timeLimit,
      sizeLimit: this.options.sizeLimit,
    };
    if (this.options.searchAttributes) {
      options.attributes = this.options.searchAttributes;
    }

    return this.search(this.options.searchBase, options)
      .then(
        (result) =>
          new Promise<undefined | Ldap.SearchEntryObject>((resolve, reject) => {
            if (!result) {
              return reject(new Error('No result from search.'));
            }

            switch (result.length) {
              case 0:
                // eslint-disable-next-line unicorn/no-useless-undefined
                return resolve(undefined);
              case 1:
                return resolve(result[0]);
              default:
                return reject(new Error(`unexpected number of matches (${result.length}) for "${username}" username`));
            }
          }),
      )
      .catch((error: Error) => {
        const message = error.toString();
        this.logger.error(`user search error: ${message}`, message);

        throw error;
      });
  }

  /**
   * Find groups for given user
   *
   * @private
   * @param {Ldap.SearchEntryObject} user The LDAP user object
   * @returns {Promise<Ldap.SearchEntryObject>} Result handling callback
   */
  private async findGroups(user: Ldap.SearchEntryObject): Promise<Ldap.SearchEntryObject> {
    if (!user) {
      throw new Error('no user');
    }

    const searchFilter =
      typeof this.options.groupSearchFilter === 'function' ? this.options.groupSearchFilter(user) : undefined;

    const options: Ldap.SearchOptions = {
      filter: searchFilter,
      scope: this.options.groupSearchScope,
      timeLimit: this.options.timeLimit,
      sizeLimit: this.options.sizeLimit,
    };
    if (this.options.groupSearchAttributes) {
      options.attributes = this.options.groupSearchAttributes;
    } else {
      options.attributes = ldapADattributes;
    }

    return this.search(this.options.groupSearchBase || this.options.searchBase, options)
      .then((result) => {
        // eslint-disable-next-line no-param-reassign
        (user.groups as unknown) = result;

        return user;
      })
      .catch((error: Error) => {
        const message = error.toString();
        this.logger.error(`group search error: ${message}`, message);

        throw error;
      });
  }

  /**
   * Search user by Username
   *
   * @param {string} userByUsername user name
   * @returns {Promise<undefined | LdapResponseUser>} User in LDAP
   */
  public async searchByUsername(userByUsername: string, cache = true): Promise<undefined | LdapResponseUser> {
    if (cache && this.userCache) {
      // Check cache. 'cached' is `{password: <hashed-password>, user: <user>}`.
      const cached: LDAPCache = await this.userCache.get<LDAPCache>(userByUsername);
      if (cached && cached.user && cached.user.sAMAccountName) {
        this.logger.debug(`From cache: ${cached.user.sAMAccountName}`);

        return cached.user as LdapResponseUser;
      }
    }

    return this.findUser(userByUsername)
      .then((search) => {
        const user = (search as unknown) as LdapResponseUser;

        if (user && this.userCache) {
          this.logger.debug(`To cache: ${user.dn}`);
          this.userCache.set<LDAPCache>(user.dn, { user, password: '' }, this.ttl);

          this.logger.debug(`To cache: ${user.sAMAccountName}`);
          this.userCache.set<LDAPCache>(user.sAMAccountName, { user, password: '' }, this.ttl);
        }

        return user;
      })
      .catch((error: Error) => {
        const message = error.toString();
        this.logger.error(`Search by Username error: ${message}`, message);

        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined;
      });
  }

  /**
   * Search user by DN
   *
   * @param {string} userByDN user distinguished name
   * @returns {Promise<undefined | LdapResponseUser>} User in LDAP
   */
  public async searchByDN(userByDN: string, cache = true): Promise<undefined | LdapResponseUser> {
    if (cache && this.userCache) {
      // Check cache. 'cached' is `{password: <hashed-password>, user: <user>}`.
      const cached: LDAPCache = await this.userCache.get<LDAPCache>(userByDN);
      if (cached && cached.user && cached.user.sAMAccountName) {
        this.logger.debug(`From cache: ${cached.user.sAMAccountName}`);

        return cached.user as LdapResponseUser;
      }
    }

    const options = {
      scope: this.options.searchScope,
      attributes: ['*'],
      timeLimit: this.options.timeLimit,
      sizeLimit: this.options.sizeLimit,
    };
    if (this.options.searchAttributes) {
      options.attributes = this.options.searchAttributes;
    }

    return this.search(userByDN, options)
      .then(
        (result) =>
          new Promise<undefined | LdapResponseUser>((resolve, reject) => {
            if (!result) {
              throw new Error('No result from search.');
            }

            switch (result.length) {
              case 0:
                // eslint-disable-next-line unicorn/no-useless-undefined
                return resolve(undefined);
              case 1:
                return resolve((result[0] as unknown) as LdapResponseUser);
              default:
                return reject(new Error(`unexpected number of matches (${result.length}) for "${userByDN}" user DN`));
            }
          }),
      )
      .then((user) => {
        if (user && this.userCache) {
          this.logger.debug(`To cache: ${userByDN}`);
          this.userCache.set<LDAPCache>(userByDN, { user, password: '' }, this.ttl);

          this.logger.debug(`To cache: ${user.sAMAccountName}`);
          this.userCache.set<LDAPCache>(user.sAMAccountName, { user, password: '' }, this.ttl);
        }

        return user;
      })
      .catch((error: Error) => {
        this.logger.error('Search by DN error:', error);

        // eslint-disable-next-line unicorn/no-useless-undefined
        return undefined;
      });
  }

  /**
   * Synchronize users
   *
   * @returns {undefined | LdapResponseUser[]} User in LDAP
   * @throws {Error}
   */
  public async synchronization(): Promise<LdapResponseUser[]> {
    const options = {
      filter: this.options.searchFilterAllUsers,
      scope: this.options.searchScopeAllUsers,
      attributes: ldapADattributes,
      timeLimit: this.options.timeLimit,
      sizeLimit: this.options.sizeLimit,
    };
    if (this.options.searchAttributesAllUsers) {
      options.attributes = this.options.searchAttributesAllUsers;
    }

    return this.search(this.options.searchBase, options)
      .then(async (sync) => {
        if (sync) {
          const groupsPromises = sync.map(async (u) => {
            await this.getGroups(u);
          });

          await Promise.allSettled(groupsPromises);

          return (sync as unknown) as LdapResponseUser[];
        }

        this.logger.error('Synchronize unknown error.');
        throw new Error('Synchronize unknown error.');
      })
      .catch((error: Error) => {
        const message = error.toString();
        this.logger.error(`Synchronize error: ${message}`, message);

        throw error;
      });
  }

  /**
   * Synchronize users
   *
   * @returns {undefined | LdapResponseGroup[]} Group in LDAP
   * @throws {Error}
   */
  public async synchronizationGroups(): Promise<LdapResponseGroup[]> {
    const options = {
      filter: this.options.searchFilterAllGroups,
      scope: this.options.groupSearchScope,
      attributes: ldapADattributes,
      timeLimit: this.options.timeLimit,
      sizeLimit: this.options.sizeLimit,
    };
    if (this.options.groupSearchAttributes) {
      options.attributes = this.options.groupSearchAttributes;
    }

    return this.search(this.options.searchBase, options)
      .then((sync) => {
        if (sync) {
          return (sync as unknown) as LdapResponseGroup[];
        }

        this.logger.error('synchronizationGroups: unknown error.');
        throw new Error('synchronizationGroups: unknown error.');
      })
      .catch((error: Error) => {
        const message = error.toString();
        this.logger.error(`synchronizationGroups error: ${message}`, message);

        throw new Error(`synchronizationGroups error: ${message}`);
      });
  }

  /**
   * Modify using the admin client.
   *
   * @private
   * @async
   * @param {string} dn LDAP Distiguished Name
   * @param {Change[]} data LDAP modify data
   * @param {string} username The optional parameter
   * @param {string} password The optional parameter
   * @returns {boolean} The result
   * @throws {Ldap.Error}
   */
  public async modify(dn: string, data: Change[], username?: string, password?: string): Promise<boolean> {
    return this.adminBind().then(
      () =>
        new Promise<boolean>((resolve, reject) => {
          if (password) {
            // If a password, then we try to connect with user's login and password, and try to modify
            this.userClient.bind(dn, password, (error): any => {
              data.forEach((d, i, a) => {
                if (d.modification.type === 'thumbnailPhoto' || d.modification.type === 'jpegPhoto') {
                  // eslint-disable-next-line no-param-reassign
                  a[i].modification.vals = '...skipped...';
                }
              });

              if (error) {
                const message = error.toString();
                this.logger.error(`bind error: ${message}`, message);

                return reject(error);
              }

              return this.userClient.modify(
                dn,
                data,
                async (searchError: Ldap.Error | null): Promise<void> => {
                  if (searchError) {
                    this.logger.error(`Modify error "${dn}": ${searchError}`, searchError);

                    reject(searchError);
                  }

                  this.logger.info(`Modify success "${dn}"`);

                  if (this.userCache) {
                    await this.userCache.del(dn);
                    this.logger.debug(`Modify: cache reset: ${dn}`);

                    if (username) {
                      await this.userCache.del(username);
                      this.logger.debug(`Modify: cache reset: ${username}`);
                    }
                  }

                  resolve(true);
                },
              );
            });
          } else {
            this.adminClient.modify(
              dn,
              data,
              async (searchError: Ldap.Error | null): Promise<void> => {
                data.forEach((d, i, a) => {
                  if (d.modification.type === 'thumbnailPhoto' || d.modification.type === 'jpegPhoto') {
                    // eslint-disable-next-line no-param-reassign
                    a[i].modification.vals = '...skipped...';
                  }
                });

                if (searchError) {
                  this.logger.error(`Modify error "${dn}": ${JSON.stringify(data)}`);
                  this.logger.error(`Modify error "${dn}": ${searchError}`);

                  reject(searchError);
                  return;
                }

                this.logger.info(`Modify success "${dn}": ${JSON.stringify(data)}`);

                if (this.userCache) {
                  await this.userCache.del(dn);
                  this.logger.debug(`Modify: cache reset: ${dn}`);

                  if (username) {
                    await this.userCache.del(username);
                    this.logger.debug(`Modify: cache reset: ${username}`);
                  }
                }

                resolve(true);
              },
            );
          }
        }),
    );
  }

  /**
   * Authenticate given credentials against LDAP server
   *
   * @async
   * @param {string} username The username to authenticate
   * @param {string} password The password to verify
   * @returns {LdapResponseUser} User in LDAP
   * @throws {Error}
   */
  public async authenticate(username: string, password: string): Promise<LdapResponseUser> {
    if (typeof password === 'undefined' || password === null || password === '') {
      this.logger.error('No password given');
      throw new Error('No password given');
    }

    if (this.userCache) {
      // Check cache. 'cached' is `{password: <hashed-password>, user: <user>}`.
      const cached: LDAPCache = await this.userCache.get<LDAPCache>(username);
      if (
        cached &&
        cached.user &&
        cached.user.sAMAccountName &&
        cached.password &&
        bcrypt.compareSync(password, cached.password)
      ) {
        this.logger.debug(`From cache: ${cached.user.sAMAccountName}`);

        return cached.user as LdapResponseUser;
      }
    }

    // 1. Find the user DN in question.
    const foundUser = await this.findUser(username).catch((error: Error) => {
      this.logger.error(`Not found user: "${username}"`, error);

      throw error;
    });
    if (!foundUser) {
      this.logger.error(`Not found user: "${username}"`);

      throw new Error(`Not found user: "${username}"`);
    }

    // 2. Attempt to bind as that user to check password.
    return new Promise<LdapResponseUser>((resolve, reject) => {
      this.userClient.bind(
        foundUser[this.options.bindProperty || 'dn'],
        password,
        async (bindError): Promise<unknown | LdapResponseUser> => {
          if (bindError) {
            this.logger.error('bind error:', bindError);

            return reject(new Error(bindError.message));
          }

          // 3. If requested, fetch user groups
          try {
            const userWithGroups = ((await this.getGroups(foundUser)) as unknown) as LdapResponseUser;

            if (this.userCache) {
              this.logger.debug(`To cache: ${userWithGroups.sAMAccountName}`);

              this.userCache.set<LDAPCache>(
                userWithGroups.sAMAccountName,
                {
                  user: userWithGroups,
                  password: bcrypt.hashSync(password, this.salt),
                },
                this.ttl,
              );
            }

            return resolve(userWithGroups as LdapResponseUser);
          } catch (error) {
            const message = error.toString();
            this.logger.error(`Authenticate error: ${message}`, message);

            return reject(`Authenticate error: ${JSON.stringify(error)}`);
          }
        },
      );
    });
  }

  /**
   * This is add a LDAP object
   *
   * @async
   * @param {Record<string, string>} value
   * @returns {LdapResponseUser} User | Profile in LDAP
   * @throws {Error}
   */
  public async add(entry: LDAPAddEntry): Promise<LdapResponseUser | undefined> {
    return this.adminBind().then(
      () =>
        new Promise<LdapResponseUser | undefined>((resolve, reject) => {
          if (!this.options.newObject) {
            throw new Error('ADD operation not available');
          }

          const dn = `CN=${this.sanitizeInput(entry.cn as string)},${this.sanitizeInput(this.options.newObject)}`;
          this.adminClient.add(dn, entry, (error: Error) => {
            if (error) {
              return reject(error);
            }

            return resolve(this.searchByDN(dn));
          });
        }),
    );
  }

  /**
   * Unbind connections
   *
   * @returns {Promise<boolean>}
   */
  public async close(): Promise<boolean> {
    // It seems to be OK just to call unbind regardless of if the
    // client has been bound (e.g. how ldapjs pool destroy does)
    return new Promise<boolean>((resolve) => {
      this.adminClient.unbind(() => {
        this.logger.info('adminClient: close');

        this.userClient.unbind(() => {
          this.logger.info('userClient: close');

          resolve(true);
        });
      });
    });
  }
}
