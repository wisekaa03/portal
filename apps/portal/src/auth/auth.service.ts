/** @format */

//#region Imports NPM
import { Injectable, HttpService, UnauthorizedException } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express';
import { LdapService } from 'nestjs-ldap';
import Ldap from 'ldapjs';
import Redis from 'redis';
//#endregion
//#region Imports Local
import { LoginEmail, EmailSession } from '@lib/types/auth';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config';
import { UserService } from '@back/user/user.service';
import { UserEntity } from '@back/user/user.entity';
import { PortalError } from '@back/shared/errors';
//#endregion

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly ldapService: LdapService,
    @InjectPinoLogger(AuthService.name) private readonly logger: PinoLogger,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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
  public validate = async (request: Request): Promise<User> => {
    if (request.user?.id) {
      const user = await this.userService.byId(request.user.id);

      return user;
    }

    throw new UnauthorizedException();
  };

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

    const ldapUser = await this.ldapService.authenticate(username, password).catch((error) => {
      if (error instanceof Ldap.InvalidCredentialsError) {
        throw new UnauthorizedException();
      }

      this.logger.error(`LDAP login: ${error}`);
      throw new UnauthorizedException();
    });

    return this.userService
      .fromLdap(ldapUser)
      .then((user) => {
        if (user.disabled) {
          this.logger.error(`User is Disabled: ${user.username}`);

          throw new Error(PortalError.USER_DISABLED);
        }

        return user;
      })
      .catch((error: Error) => {
        this.logger.error(`Error: not found user: ${error.toString()}`, [{ error }]);

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

        this.logger.info('Reset database cache');

        databaseStoreReset = true;
      } catch (error) {
        const message = error.toString();
        this.logger.error(`Unable to reset database cache: ${message}`, message);
      }

      redisDatabase.quit();
    }

    if (this.configService.get<string>('LDAP_REDIS_URI')) {
      const redisLdap = Redis.createClient({
        url: this.configService.get<string>('LDAP_REDIS_URI'),
      });

      try {
        redisLdap.flushdb();

        this.logger.info('Reset LDAP cache');

        ldapCacheReset = true;
      } catch (error) {
        const message = error.toString();
        this.logger.error(`Unable to reset LDAP cache: ${message}`, message);
      }

      redisLdap.quit();
    }

    if (this.configService.get<string>('HTTP_REDIS_URI')) {
      const redisHttp = Redis.createClient({
        url: this.configService.get<string>('HTTP_REDIS_URI'),
      });

      try {
        redisHttp.flushdb();

        this.logger.info('Reset HTTP cache');

        httpStoreReset = true;
      } catch (error) {
        const message = error.toString();
        this.logger.error(`Unable to reset LDAP cache: ${message}`, message);
      }

      redisHttp.quit();
    }

    try {
      const redisSession = Redis.createClient({
        url: this.configService.get<string>('SESSION_REDIS_URI'),
      });

      try {
        redisSession.flushdb();

        this.logger.info('Reset session cache');
      } catch (error) {
        const message = error.toString();
        this.logger.error(`Unable to reset session cache: ${message}`, message);
      }

      redisSession.quit();

      sessionStoreReset = true;
    } catch (error) {
      const message = error.toString();
      this.logger.error(`Error in cache reset, session store: ${message}`, message);
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
  loginEmail = async (email: string, password: string, request: Request, response: Response): Promise<LoginEmail> =>
    this.httpService
      .post<EmailSession>(this.configService.get<string>('MAIL_LOGIN_URL'), {
        email,
        password,
      })
      .toPromise()
      .then(
        (axiosResponse) => {
          const { sessid, sessauth } = axiosResponse.data;
          if (sessid && sessauth && sessauth !== '-del-') {
            const options = {
              domain: `.${this.configService.get<string>('DOMAIN')}`,
              maxAge: this.configService.get<number>('SESSION_COOKIE_TTL'),
            };

            response.cookie('roundcube_sessid', sessid, options);
            response.cookie('roundcube_sessauth', sessauth, options);

            if (request.session) {
              request.session.mailSession = {
                sessid,
                sessauth,
              };
            }

            return { login: true };
          }

          throw new Error(PortalError.MAIL_NOT_AUTHORIZED);
        },
        (error: Error) => {
          throw error;
        },
      );
}
