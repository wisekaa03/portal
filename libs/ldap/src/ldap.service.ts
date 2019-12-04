/** @format */

// #region Imports NPM
import { Inject, Injectable } from '@nestjs/common';
import Ldap from 'ldapjs';
import { EventEmitter } from 'events';
import * as cacheManager from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { LDAP_OPTIONS, LdapModuleOptions, LDAPCache, LDAP_SYNCH, LdapResponseUser } from './ldap.interface';
// #endregion

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

  private ttl: number;

  /**
   * Create an LDAP class.
   *
   * @param {Object} opts - Config options
   * @constructor
   */
  constructor(
    @Inject(LDAP_OPTIONS) private readonly opts: LdapModuleOptions,
    private readonly logger: LogService,
    private readonly configService: ConfigService,
  ) {
    super();

    if (opts.cache) {
      this.ttl = configService.get<number>('LDAP_REDIS_TTL');

      this.userCacheStore = redisStore.create({
        // A string used to prefix all used keys (e.g. namespace:test).
        // Please be aware that the keys command will not be prefixed.
        prefix: 'LDAP',
        host: configService.get<string>('LDAP_REDIS_HOST'), // IP address of the Redis server
        port: configService.get<number>('LDAP_REDIS_PORT'), // Port of the Redis server
        db: configService.get<number>('LDAP_REDIS_DB'), // If set, client will run Redis select command on connect.
        // If set, client will run Redis auth command on connect.
        password: configService.get<string>('LDAP_REDIS_PASSWORD') || undefined,
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

      this.logger.debug(
        `install cache: ` +
          `host="${configService.get('LDAP_REDIS_HOST')}" ` +
          `port="${configService.get('LDAP_REDIS_PORT')}" ` +
          `db="${configService.get('LDAP_REDIS_DB')}" ` +
          // `max="${configService.get('LDAP_REDIS_MAX')}" ` +
          `ttl="${this.ttl}" ` +
          `password="${configService.get('LDAP_REDIS_PASSWORD') ? '{MASKED}' : ''}"`,
        'LDAP',
      );
    }

    this.clientOpts = {
      url: opts.url,
      tlsOptions: opts.tlsOptions,
      socketPath: opts.socketPath,
      log: opts.logger,
      timeout: opts.timeout,
      connectTimeout: opts.connectTimeout,
      idleTimeout: opts.idleTimeout,
      reconnect: opts.reconnect,
      strictDN: opts.strictDN,
      queueSize: opts.queueSize,
      queueTimeout: opts.queueTimeout,
      queueDisable: opts.queueDisable,
    };

    this.bindDN = opts.bindDN;
    this.bindCredentials = opts.bindCredentials;

    this.adminClient = Ldap.createClient(this.clientOpts);
    this.adminBound = false;
    this.userClient = Ldap.createClient(this.clientOpts);
    this.adminClient.on('error', this.handleErrorAdmin.bind(this));
    this.userClient.on('error', this.handleErrorUser.bind(this));

    if (opts.reconnect) {
      this.once('installReconnectListener', () => {
        this.logger.log('install reconnect listener', 'LDAP');
        this.adminClient.on('connect', () => this.onConnectAdmin());
      });
    }

    this.adminClient.on('connectTimeout', this.handleErrorAdmin.bind(this));
    this.userClient.on('connectTimeout', this.handleErrorUser.bind(this));

    if (opts.groupSearchBase && opts.groupSearchFilter) {
      if (typeof opts.groupSearchFilter === 'string') {
        const { groupSearchFilter } = opts;
        // eslint-disable-next-line no-param-reassign
        opts.groupSearchFilter = (user: any): string => {
          return groupSearchFilter
            .replace(/{{dn}}/g, opts.groupDnProperty && user[opts.groupDnProperty])
            .replace(/{{username}}/g, user.uid);
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
   * @param {string} objectGUID - GUID in AD
   * @returns {string} - string GUID
   */
  GUIDtoString = (objectGUID: string): string =>
    Buffer.from(objectGUID, 'base64')
      .toString('hex')
      .replace(
        /^(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)$/,
        '$4$3$2$1-$6$5-$8$7-$10$9-$16$15$14$13$12$11',
      )
      .toUpperCase();

  /**
   * Mark admin client unbound so reconnect works as expected and re-emit the error
   *
   * @private
   * @param {Error} err - The error to be logged and emitted
   * @returns {void}
   */
  private handleErrorAdmin(err: Ldap.Error): void {
    if (`${err.code}` !== 'ECONNRESET') {
      this.logger.error(`admin emitted error: [${err.code}]`, err.toString(), 'LDAP');
    }
    this.adminBound = false;
  }

  /**
   * Mark user client unbound so reconnect works as expected and re-emit the error
   *
   * @private
   * @param {Error} err - The error to be logged and emitted
   * @returns {void}
   */
  private handleErrorUser(err: Ldap.Error): void {
    if (`${err.code}` !== 'ECONNRESET') {
      this.logger.error(`user emitted error: [${err.code}]`, err.toString(), 'LDAP');
    }
    // this.adminBound = false;
  }

  /**
   * Bind adminClient to the admin user on connect
   *
   * @private
   * @returns {boolean | Error}
   */
  private async onConnectAdmin(): Promise<boolean> {
    // Anonymous binding
    if (typeof this.bindDN === 'undefined' || this.bindDN === null) {
      this.adminBound = false;

      throw new Error('bindDN is undefined');
    }

    this.logger.log(`bind: ${this.bindDN} ...`, 'LDAP');

    return new Promise<boolean>((resolve, reject) =>
      this.adminClient.bind(this.bindDN, this.bindCredentials, (error: Ldap.Error) => {
        if (error) {
          this.logger.error('bind error:', error.toString(), 'LDAP');
          this.adminBound = false;

          return reject(error);
        }

        this.logger.log('bind ok', 'LDAP');
        this.adminBound = true;
        if (this.opts.reconnect) {
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
   * @param {string} searchBase - LDAP search base
   * @param {Object} options - LDAP search options
   * @param {string} options.filter - LDAP search filter
   * @param {string} options.scope - LDAP search scope
   * @param {(string[]|undefined)} options.attributes - Attributes to fetch
   * @returns {undefined | Ldap.SearchEntryObject | Ldap.SearchEntryObject[]}
   */
  private async search(searchBase: string, options: Ldap.SearchOptions): Promise<undefined | Ldap.SearchEntryObject[]> {
    return this.adminBind().then(
      () =>
        new Promise<undefined | Ldap.SearchEntryObject[]>((resolve, reject) =>
          this.adminClient.search(
            searchBase,
            options,
            (searchErr: Ldap.Error | null, searchResult: Ldap.SearchCallbackResponse) => {
              if (searchErr) {
                reject(searchErr);
              }

              const items: Ldap.SearchEntryObject[] = [];
              searchResult.on('searchEntry', (entry: Ldap.SearchEntry) => {
                const { object } = entry;
                // TODO: разобраться с предупреждениями
                // eslint-disable-next-line no-restricted-syntax, guard-for-in
                for (const prop in object) {
                  if (/;binary$/.test(prop)) {
                    object[prop.replace(/;binary$/, '')] = object[prop];
                  }
                }
                if (object.hasOwnProperty('objectGUID')) {
                  object.objectGUID = this.GUIDtoString(object.objectGUID as string);
                }
                items.push(object);
                if (this.opts.includeRaw === true) {
                  items[items.length - 1].raw = (entry.raw as unknown) as string;
                }
              });

              searchResult.on('error', (error: Ldap.Error) => reject(error));

              searchResult.on('end', (result: Ldap.LDAPResult) => {
                if (result.status !== 0) {
                  return reject(new Error(`non-zero status from LDAP search: ${result.status}`));
                }

                return resolve(items);
              });

              return undefined;
            },
          ),
        ),
    );
  }

  /**
   * Sanitize LDAP special characters from input
   *
   * {@link https://tools.ietf.org/search/rfc4515#section-3}
   *
   * @private
   * @param {string} input - String to sanitize
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
   * @param {string} username - Username to search for
   * @returns {undefined} - If user is not found but no error happened, result is undefined.
   */
  private async findUser(username: string): Promise<undefined | Ldap.SearchEntryObject> {
    if (!username) {
      throw new Error('empty username');
    }

    const searchFilter = this.opts.searchFilter.replace(/{{username}}/g, this.sanitizeInput(username));
    const opts = {
      filter: searchFilter,
      scope: this.opts.searchScope,
      attributes: ['*'],
      timeLimit: this.opts.timeLimit,
      sizeLimit: this.opts.sizeLimit,
    };
    if (this.opts.searchAttributes) {
      opts.attributes = this.opts.searchAttributes;
    }

    return this.search(this.opts.searchBase, opts)
      .then(
        (result) =>
          new Promise<undefined | Ldap.SearchEntryObject>((resolve, reject) => {
            if (!result) {
              throw new Error('No result from search.');
            }

            switch (result.length) {
              case 0:
                return resolve(undefined);
              case 1:
                return resolve(result[0]);
              default:
                return reject(new Error(`unexpected number of matches (${result.length}) for "${username}" username`));
            }
          }),
      )
      .catch((error: Ldap.Error) => {
        this.logger.error(`user search error: [${error.code}] ${error.name}`, error.toString(), 'LDAP');

        throw error;
      });
  }

  /**
   * Find groups for given user
   *
   * @private
   * @param {Object} user - The LDAP user object
   * @returns {void} - Result handling callback
   */
  private async findGroups(user: Ldap.SearchEntryObject): Promise<Ldap.SearchEntryObject> {
    if (!user) {
      throw new Error('no user');
    }

    const searchFilter =
      typeof this.opts.groupSearchFilter === 'function' ? this.opts.groupSearchFilter(user) : undefined;

    const opts = {
      filter: searchFilter,
      scope: this.opts.groupSearchScope,
      attributes: ['*'],
      timeLimit: this.opts.timeLimit,
      sizeLimit: this.opts.sizeLimit,
    };
    if (this.opts.groupSearchAttributes) {
      opts.attributes = this.opts.groupSearchAttributes;
    }

    return this.search(this.opts.groupSearchBase || this.opts.searchBase, opts)
      .then(
        (result) =>
          new Promise<Ldap.SearchEntryObject>((resolve) => {
            // eslint-disable-next-line no-param-reassign
            (user.groups as unknown) = result;

            return resolve(user);
          }),
      )
      .catch((error: Ldap.Error) => {
        this.logger.error(`group search error: [${error.code}] ${error.name}`, error.toString(), 'LDAP');

        throw error;
      });
  }

  /**
   * Search user by DN
   *
   * @returns {undefined | LdapResponeUser[]} - User in LDAP
   */
  public async searchByDN(userByDN: string): Promise<undefined | LdapResponseUser> {
    if (this.userCache) {
      // Check cache. 'cached' is `{password: <hashed-password>, user: <user>}`.
      const cached: LDAPCache = await this.userCache.get<LDAPCache>(userByDN);
      if (cached && cached.user && cached.user.sAMAccountName) {
        this.logger.debug(`From cache: ${cached.user.sAMAccountName}`, 'LDAP');

        return cached.user as LdapResponseUser;
      }
    }

    const opts = {
      scope: this.opts.searchScope,
      attributes: ['*'],
      timeLimit: this.opts.timeLimit,
      sizeLimit: this.opts.sizeLimit,
    };
    if (this.opts.searchAttributes) {
      opts.attributes = this.opts.searchAttributes;
    }

    return this.search(userByDN, opts)
      .then(
        (result) =>
          new Promise<undefined | LdapResponseUser>((resolve, reject) => {
            if (!result) {
              throw new Error('No result from search.');
            }

            switch (result.length) {
              case 0:
                return resolve(undefined);
              case 1:
                return resolve(result[0] as LdapResponseUser);
              default:
                return reject(new Error(`unexpected number of matches (${result.length}) for "${userByDN}" user DN`));
            }
          }),
      )
      .then((user) => {
        if (user && this.userCache) {
          this.logger.debug(`To cache: ${userByDN}`, 'LDAP');
          this.userCache.set<LDAPCache>(
            userByDN,
            {
              user,
            },
            this.ttl,
          );

          this.logger.debug(`To cache: ${user.sAMAccountName}`, 'LDAP');
          this.userCache.set<LDAPCache>(
            user.sAMAccountName,
            {
              user,
            },
            this.ttl,
          );
        }

        return user;
      })
      .catch((error: Ldap.Error) => {
        this.logger.error('Search by DN error:', error.toString(), 'LDAP');

        return undefined;
      });
  }

  /**
   * Synchronize users
   *
   * @returns {undefined | LdapResponeUser[]} - User in LDAP
   */
  public async synchronization(): Promise<undefined | LdapResponseUser[]> {
    if (this.userCache) {
      const cached: LDAPCache = await this.userCache.get<LDAPCache>(LDAP_SYNCH);
      // TODO: придумать что-нибудь половчее моих synchronization
      if (cached && cached.synch) {
        this.logger.debug(`Synchronization from cache`, 'LDAP');

        return cached.synch as LdapResponseUser[];
      }
    }

    const opts = {
      filter: this.opts.searchFilterAllUsers,
      scope: this.opts.searchScopeAllUsers,
      attributes: ['*'],
      timeLimit: this.opts.timeLimit,
      sizeLimit: this.opts.sizeLimit,
    };
    if (this.opts.searchAttributesAllUsers) {
      opts.attributes = this.opts.searchAttributesAllUsers;
    }

    return this.search(this.opts.searchBaseAllUsers, opts)
      .then((synch) => {
        if (synch) {
          if (this.userCache) {
            if (this.userCacheStore.reset) {
              this.userCacheStore.reset((error: any) => {
                if (error) {
                  this.logger.error('LDAP cache error', error.toString(), 'LDAP');
                }
              });
            }

            this.logger.debug(`To cache: SYNCHRONIZATION`, 'LDAP');

            this.userCache.set<LDAPCache>(
              LDAP_SYNCH,
              {
                synch,
              },
              this.ttl,
            );
          }

          synch.forEach(async (u) => {
            // eslint-disable-next-line no-debugger
            debugger;

            return this.getGroups(u);
          });

          return synch as LdapResponseUser[];
        }

        this.logger.error('Synchronize unknown error.', undefined, 'LDAP');

        return undefined;
      })
      .catch((error: Ldap.Error) => {
        this.logger.error('Synchronize error:', error.toString(), 'LDAP');

        return undefined;
      });
  }

  /**
   * Modify using the admin client.
   *
   * @private
   * @param {string} dn - LDAP Distiguished Name
   * @param {Object} data - LDAP modify data
   * @returns {undefined | boolean}
   */
  public async modify(dn: string, data: Ldap.Change, username?: string): Promise<undefined | boolean> {
    return this.adminBind().then(
      () =>
        new Promise<undefined | boolean>((resolve, reject) =>
          this.adminClient.modify(dn, data, async (searchErr: Ldap.Error | null) => {
            if (searchErr) {
              this.logger.error(`Modify error "${dn}": ${JSON.stringify(data)}`, JSON.stringify(searchErr), 'LDAP');

              return reject(searchErr);
            }

            this.logger.log(`Modify success "${dn}": ${JSON.stringify(data)}`, 'LDAP');

            if (username && this.userCache) {
              this.logger.debug(`Modify: cache reset: ${username}`, 'LDAP');

              await this.userCache.del(username);
            }

            return resolve(true);
          }),
        ),
    );
  }

  /**
   * Resets LDAP cache
   *
   * @returns {Promise<boolean>} - User in LDAP
   */
  public async cacheReset(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (this.userCacheStore.reset) {
        this.userCacheStore.reset((error: any) => {
          if (error) {
            this.logger.error('LDAP cache error', error, 'LDAP');
            reject(error);
          } else {
            resolve(true);
          }
        });
      } else {
        reject(new Error('LDAP not initialized with cache.'));
      }
    });
  }

  /**
   * Authenticate given credentials against LDAP server
   *
   * @param {string} username - The username to authenticate
   * @param {string} password - The password to verify
   * @returns {undefined | LdapResponeUser} - User in LDAP
   */
  public async authenticate(username: string, password: string): Promise<undefined | LdapResponseUser> {
    if (typeof password === 'undefined' || password === null || password === '') {
      this.logger.error('No password given', undefined, 'LDAP');
      throw new Error('No password given');
    }

    if (this.userCache) {
      // Check cache. 'cached' is `{password: <hashed-password>, user: <user>}`.
      const cached: LDAPCache = await this.userCache.get<LDAPCache>(username);
      if (cached && cached.user && cached.user.sAMAccountName) {
        this.logger.debug(`From cache: ${cached.user.sAMAccountName}`, 'LDAP');

        return cached.user as LdapResponseUser;
      }
    }

    // 1. Find the user DN in question.
    const foundUser = await this.findUser(username).catch((error: Ldap.Error) => {
      this.logger.error(`Not found user: "${username}"`, error.toString(), 'LDAP');

      throw error;
    });
    if (!foundUser) {
      this.logger.error(`Not found user: "${username}"`, undefined, 'LDAP');

      return undefined;
    }

    // 2. Attempt to bind as that user to check password.
    return new Promise<undefined | LdapResponseUser>((resolve, reject) => {
      this.userClient.bind(
        foundUser[this.opts.bindProperty || 'dn'],
        password,
        async (bindErr?: Ldap.Error): Promise<unknown | LdapResponseUser> => {
          if (bindErr) {
            this.logger.error('bind error:', bindErr.toString(), 'LDAP');

            return reject(bindErr);
          }

          // 3. If requested, fetch user groups
          try {
            const userWithGroups = (await this.getGroups(foundUser)) as LdapResponseUser;

            if (this.userCache) {
              this.logger.debug(`To cache: ${userWithGroups.sAMAccountName}`, 'LDAP');

              this.userCache.set<LDAPCache>(
                userWithGroups.sAMAccountName,
                {
                  user: userWithGroups as LdapResponseUser,
                },
                this.ttl,
              );
            }

            return resolve(userWithGroups as LdapResponseUser);
          } catch (error) {
            this.logger.error('Authenticate:', error.toString(), 'LDAP');

            return reject(Error(`Authenticate: ${error.toString()}`));
          }
        },
      );
    }).catch((error) => {
      this.logger.error('Authenticate:', error.toString(), 'LDAP');

      return undefined;
    });
  }

  /**
   * Unbind connections
   *
   * @param {voidCallback} callback - Callback
   * @returns {boolean}
   */
  public async close(): Promise<boolean> {
    // It seems to be OK just to call unbind regardless of if the
    // client has been bound (e.g. how ldapjs pool destroy does)
    return new Promise((resolve) => {
      this.adminClient.unbind(() => {
        this.logger.log('adminClient: close', 'LDAP');

        this.userClient.unbind(() => {
          this.logger.log('userClient: close', 'LDAP');

          resolve(true);
        });
      });
    });
  }
}
