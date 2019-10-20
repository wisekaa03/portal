/** @format */

// #region Imports NPM
import { Inject, Injectable } from '@nestjs/common';
import Ldap from 'ldapjs';
import { EventEmitter } from 'events';
import * as cacheManager from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import * as bcrypt from 'bcrypt';
// #endregion
// #region Imports Local
import { LDAP_MODULE_OPTIONS, LdapModuleOptions, LdapResponeUser } from './interfaces/ldap.interface';
import { ConfigService } from '../config/config.service';
import { LogService } from '../logger/logger.service';
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

  private userCache: cacheManager.Cache;

  private ttl: number;

  /**
   * Create an LDAP class.
   *
   * @param {Object} opts - Config options
   * @constructor
   */
  constructor(
    @Inject(LDAP_MODULE_OPTIONS) private readonly opts: LdapModuleOptions,
    private readonly logger: LogService,
    private readonly configService: ConfigService,
  ) {
    super();

    if (opts.cache) {
      this.ttl = parseInt(configService.get('LDAP_REDIS_TTL'), 10);

      this.userCache = cacheManager.caching({
        store: redisStore,
        name: 'LDAP',
        ttl: this.ttl, // seconds
        host: configService.get('LDAP_REDIS_HOST'),
        port: parseInt(configService.get('LDAP_REDIS_PORT'), 10),
        db: configService.get('LDAP_REDIS_DB') ? parseInt(configService.get('LDAP_REDIS_DB'), 10) : undefined,
        password: configService.get('LDAP_REDIS_PASSWORD') ? configService.get('LDAP_REDIS_PASSWORD') : undefined,
        logger,
      });

      this.logger.debug(
        `install cache: ` +
          `host="${configService.get('LDAP_REDIS_HOST')}" ` +
          `port="${configService.get('LDAP_REDIS_PORT')}" ` +
          `db="${configService.get('LDAP_REDIS_DB')}" ` +
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
    Buffer.from(objectGUID, 'binary')
      .toString('hex')
      .replace(
        /^(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)(..)$/,
        '$4$3$2$1-$6$5-$8$7-$10$9-$15$14$13$12$11',
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
              searchErr && reject(searchErr);

              const items: Ldap.SearchEntryObject[] = [];
              searchResult.on('searchEntry', (entry: Ldap.SearchEntry) => {
                const { object } = entry;
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
    };
    if (this.opts.groupSearchAttributes) {
      opts.attributes = this.opts.groupSearchAttributes;
    }

    return this.search(this.opts.groupSearchBase || this.opts.searchBase, opts)
      .then((result) => {
        // eslint-disable-next-line no-param-reassign
        (user.groups as unknown) = result;

        return user;
      })
      .catch((error: Ldap.Error) => {
        this.logger.error(`group search error: [${error.code}] ${error.name}`, error.toString(), 'LDAP');

        throw error;
      });
  }

  /**
   * Synchronize users
   *
   * @returns {undefined | LdapResponeUser[]} - User in LDAP
   */
  public async synchronization(): Promise<undefined | LdapResponeUser[]> {
    if (this.opts.cache && this.userCache) {
      const cached = await this.userCache.get('SYNCHRONIZATION');
      // TODO: придумать что-нибудь половчее моих synchronization
      if (cached && bcrypt.compareSync('synchronization', cached.hash) && cached.result) {
        this.logger.debug(`synchronization from cache`, 'LDAP');

        return cached.result as LdapResponeUser[];
      }
    }

    const opts = {
      filter: this.opts.searchFilterAllUsers,
      scope: this.opts.searchScopeAllUsers,
      attributes: ['*'],
    };
    if (this.opts.searchAttributesAllUsers) {
      opts.attributes = this.opts.searchAttributesAllUsers;
    }

    return this.search(this.opts.searchBaseAllUsers, opts)
      .then((result) => {
        this.userCache.set<any>(
          'SYNCHRONIZATION',
          {
            result,
            hash: bcrypt.hashSync('synchronization', 10),
          },
          this.ttl,
        );

        return result as LdapResponeUser[];
      })
      .catch((error: Ldap.Error) => {
        this.logger.error('Synchronize error:', error.toString(), 'LDAP');

        return undefined;
      });
  }

  /**
   * Authenticate given credentials against LDAP server
   *
   * @param {string} username - The username to authenticate
   * @param {string} password - The password to verify
   * @returns {undefined | LdapResponeUser} - User in LDAP
   */
  public async authenticate(username: string, password: string): Promise<undefined | LdapResponeUser> {
    if (typeof password === 'undefined' || password === null || password === '') {
      this.logger.error('no password given', undefined, 'LDAP');
      throw new Error('no password given');
    }

    if (this.opts.cache && this.userCache) {
      // Check cache. 'cached' is `{password: <hashed-password>, user: <user>}`.
      const cached = await this.userCache.get(username);
      if (cached && cached.user && cached.user.username && bcrypt.compareSync(password, cached.password)) {
        this.logger.debug(`from cache: ${cached.user.username}`, 'LDAP');

        return cached.user as LdapResponeUser;
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
    return new Promise<undefined | LdapResponeUser>((resolve, reject) => {
      this.userClient.bind(
        foundUser[this.opts.bindProperty || 'dn'],
        password,
        async (bindErr: Ldap.Error): Promise<unknown | LdapResponeUser> => {
          if (bindErr) {
            this.logger.error('bind error:', bindErr.toString(), 'LDAP');

            return reject(bindErr);
          }

          // 3. If requested, fetch user groups
          try {
            const userWithGroups = await this.getGroups(foundUser);

            if (this.opts.cache) {
              this.logger.debug(`to cache: ${username}`, 'LDAP');

              this.userCache.set<any>(
                username,
                {
                  user: userWithGroups,
                  password: bcrypt.hashSync(password, 10),
                },
                this.ttl,
              );
            }

            return resolve(userWithGroups as LdapResponeUser);
          } catch (error) {
            this.logger.error('authenticate:', error.toString(), 'LDAP');

            return undefined;
          }
        },
      );
    }).catch((error) => {
      this.logger.error('authenticate:', error.toString(), 'LDAP');

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
