/** @format */

// #region Imports NPM
import { Injectable, UnauthorizedException, HttpService } from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import Redis from 'redis';
// #endregion
// #region Imports Local
import { User } from '@lib/types/user.dto';
import { MailSession } from '@lib/types/auth';
import { LogService } from '@app/logger';
import { LdapService } from '@app/ldap';
import { ConfigService } from '@app/config';
import { UserService } from '@back/user/user.service';
import { UserEntity } from '@back/user/user.entity';
import { GQLError, GQLErrorCode } from '@back/shared/gqlerror';
// #endregion

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly ldapService: LdapService,
    private readonly logService: LogService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Validate a user
   *
   * @async
   * @function validate
   * @param {Request} request
   * @returns {Promise<User>} Validated user
   * @throws {UnauthorizedException}
   */
  public validate = async (req: Request): Promise<User> =>
    req?.session?.passport?.user || GQLError({ code: GQLErrorCode.UNAUTHENTICATED_LOGIN, i18n: this.i18n });

  /**
   * Login a user
   *
   * @async
   * @method login
   * @param {string} username User login
   * @param {string} password User password
   * @param {Express.Request} req Request where the user comes from
   * @returns {UserEntity} User entity
   * @throws {Error} Exception
   */
  async login({ username, password }: { username: string; password: string }): Promise<UserEntity> {
    this.logService.debug(`User login: username = "${username}"`, AuthService.name);

    const ldapUser = await this.ldapService.authenticate(username, password);

    return this.userService.fromLdap(ldapUser).catch((error: Error) => {
      this.logService.error('Error: not found user', error, AuthService.name);

      throw error;
    });
  }

  /**
   * Cache reset. Returns true/false if successful cache reset.
   *
   * @async
   * @function cacheReset
   * @returns {boolean} The true/false if successful cache reset
   */
  cacheReset = async (): Promise<boolean> => {
    let sessionStoreReset = false;
    let databaseStoreReset = false;
    let ldapCacheReset = false;
    let httpStoreReset = false;

    if (this.configService.get<string>('DATABASE_REDIS_URI')) {
      const redisDatabase = Redis.createClient({
        url: this.configService.get<string>('DATABASE_REDIS_URI'),
      });

      try {
        redisDatabase.flushdb();

        this.logService.log('Reset database cache.', AuthService.name);

        databaseStoreReset = true;
      } catch (error) {
        this.logService.error('Unable to reset database cache:', error, AuthService.name);
      }

      redisDatabase.quit();
    }

    if (this.configService.get<string>('LDAP_REDIS_URI')) {
      const redisLdap = Redis.createClient({
        url: this.configService.get<string>('LDAP_REDIS_URI'),
      });

      try {
        redisLdap.flushdb();

        this.logService.log('Reset LDAP cache.', AuthService.name);

        ldapCacheReset = true;
      } catch (error) {
        this.logService.error('Unable to reset LDAP cache:', error, AuthService.name);
      }

      redisLdap.quit();
    }

    if (this.configService.get<string>('HTTP_REDIS_URI')) {
      const redisHttp = Redis.createClient({
        url: this.configService.get<string>('HTTP_REDIS_URI'),
      });

      try {
        redisHttp.flushdb();

        this.logService.log('Reset HTTP cache.', AuthService.name);

        httpStoreReset = true;
      } catch (error) {
        this.logService.error('Unable to reset LDAP cache:', error, AuthService.name);
      }

      redisHttp.quit();
    }

    try {
      const redisSession = Redis.createClient({
        url: this.configService.get<string>('SESSION_REDIS_URI'),
      });

      try {
        redisSession.flushdb();

        this.logService.log('Reset session cache.', AuthService.name);
      } catch (error) {
        this.logService.error('Unable to reset session cache:', error, AuthService.name);
      }

      redisSession.quit();

      sessionStoreReset = true;
    } catch (error) {
      this.logService.error('Error in cache reset, session store', error, AuthService.name);
    }

    if (databaseStoreReset && sessionStoreReset && ldapCacheReset && httpStoreReset) {
      return true;
    }

    return false;
  };

  /**
   * User Email login
   *
   * @async
   * @method loginEmail
   * @param {string} email User Email
   * @param {string} password User Password
   * @returns {AxiosResponse<MainSession>}
   */
  loginEmail = async (email: string, password: string): Promise<AxiosResponse<MailSession>> =>
    this.httpService
      .post<MailSession>(this.configService.get<string>('MAIL_LOGIN_URL'), {
        email,
        password,
      })
      .toPromise();
}
