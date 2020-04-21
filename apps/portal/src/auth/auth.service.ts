/** @format */

// #region Imports NPM
import { Injectable, HttpService } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import Redis from 'redis';
// #endregion
// #region Imports Local
import { LoginEmail, EmailSession } from '@lib/types/auth';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { LdapService } from '@app/ldap';
import { UserService } from '@back/user/user.service';
import { UserEntity } from '@back/user/user.entity';
import { GQLError, GQLErrorCode } from '@back/shared/gqlerror';
// #endregion

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly ldapService: LdapService,
    private readonly logger: LogService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    logger.setContext(AuthService.name);
  }

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
    this.logger.debug(`User login: username = "${username}"`);

    const ldapUser = await this.ldapService.authenticate(username, password);

    return this.userService.fromLdap(ldapUser).catch((error: Error) => {
      this.logger.error('Error: not found user', error);

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

        this.logger.log('Reset database cache');

        databaseStoreReset = true;
      } catch (error) {
        this.logger.error('Unable to reset database cache:', error);
      }

      redisDatabase.quit();
    }

    if (this.configService.get<string>('LDAP_REDIS_URI')) {
      const redisLdap = Redis.createClient({
        url: this.configService.get<string>('LDAP_REDIS_URI'),
      });

      try {
        redisLdap.flushdb();

        this.logger.log('Reset LDAP cache');

        ldapCacheReset = true;
      } catch (error) {
        this.logger.error('Unable to reset LDAP cache:', error);
      }

      redisLdap.quit();
    }

    if (this.configService.get<string>('HTTP_REDIS_URI')) {
      const redisHttp = Redis.createClient({
        url: this.configService.get<string>('HTTP_REDIS_URI'),
      });

      try {
        redisHttp.flushdb();

        this.logger.log('Reset HTTP cache');

        httpStoreReset = true;
      } catch (error) {
        this.logger.error('Unable to reset LDAP cache:', error);
      }

      redisHttp.quit();
    }

    try {
      const redisSession = Redis.createClient({
        url: this.configService.get<string>('SESSION_REDIS_URI'),
      });

      try {
        redisSession.flushdb();

        this.logger.log('Reset session cache');
      } catch (error) {
        this.logger.error('Unable to reset session cache:', error);
      }

      redisSession.quit();

      sessionStoreReset = true;
    } catch (error) {
      this.logger.error('Error in cache reset, session store', error);
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
  loginEmail = async (email: string, password: string, req: Request, res: Response): Promise<LoginEmail> =>
    this.httpService
      .post<EmailSession>(this.configService.get<string>('MAIL_LOGIN_URL'), {
        email,
        password,
      })
      .toPromise()
      .then(
        (response) => {
          const { sessid, sessauth } = response.data;
          if (sessid && sessauth && sessauth !== '-del-') {
            const options = {
              domain: `.${this.configService.get<string>('DOMAIN')}`,
              maxAge: this.configService.get<number>('SESSION_COOKIE_TTL'),
            };

            res.cookie('roundcube_sessid', sessid, options);
            res.cookie('roundcube_sessauth', sessauth, options);

            req!.session!.mailSession = {
              sessid,
              sessauth,
            };

            return { login: true };
          }

          throw new Error('Mail login and password did not match');
        },
        (reson: Error) => {
          throw reson;
        },
      );
}
