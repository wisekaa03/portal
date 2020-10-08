/** @format */

//#region Imports NPM
import { Injectable, Inject, HttpService, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { LdapService, InvalidCredentialsError } from 'nestjs-ldap';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import Redis from 'ioredis';
//#endregion
//#region Imports Local
import type { LoginEmail, EmailSession } from '@lib/types/auth';
import type { LoggerContext } from '@back/shared/types';
import type { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config';
import { UserService } from '@back/user/user.service';
import { UserEntity } from '@back/user/user.entity';
import { PortalError } from '@back/shared/errors';
//#endregion

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly ldapService: LdapService,
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
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
      const user = await this.userService.byId({ id: request.user.id, loggerContext: { username: request.user.username } });

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
  async login({
    username,
    password,
    loggerContext,
  }: {
    username: string;
    password: string;
    loggerContext: LoggerContext;
  }): Promise<UserEntity> {
    this.logger.info(`User login: username = "${username}"`, { context: AuthService.name, ...loggerContext });

    const ldapUser = await this.ldapService.authenticate({ username, password, loggerContext }).catch((error) => {
      this.logger.error(`LDAP login: ${error.toString()}`, { error, context: AuthService.name, ...loggerContext });

      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(__DEV__ ? error : undefined);
      }

      throw new BadRequestException(__DEV__ ? error : undefined);
    });

    return this.userService
      .fromLdap({ ldapUser, loggerContext })
      .then((user) => {
        if (user.disabled) {
          this.logger.error(`User is Disabled: ${user.username}`, {
            error: 'User is Disabled',
            context: AuthService.name,
            ...loggerContext,
          });

          throw new BadRequestException(PortalError.USER_DISABLED);
        }

        return user;
      })
      .catch((error: Error) => {
        this.logger.error(`Error: not found user: ${error.toString()}`, { error, context: AuthService.name, ...loggerContext });

        throw new InternalServerErrorException(__DEV__ ? error : undefined);
      });
  }

  /**
   * Cache reset. Returns true/false if successful cache reset.
   *
   * @async
   * @function cacheReset
   * @returns {boolean} The true/false if successful cache reset
   */
  cacheReset = async ({ loggerContext }: { loggerContext: LoggerContext }): Promise<boolean> => {
    const sessionStoreReset = false;
    const databaseStoreReset = false;
    const ldapCacheReset = false;
    const httpStoreReset = false;

    // if (this.configService.get<string>('DATABASE_REDIS_URI')) {
    //   const redisDatabase = Redis.createClient({
    //     url: this.configService.get<string>('DATABASE_REDIS_URI'),
    //   });

    //   try {
    //     redisDatabase.flushdb();

    //     this.logger.info('Reset database cache', { context: AuthService.name, ...loggerContext });

    //     databaseStoreReset = true;
    //   } catch (error) {
    //     this.logger.error(`Unable to reset database cache: ${error.toString()}`, {
    //       error,
    //       context: AuthService.name,
    //       ...loggerContext,
    //     });
    //   }

    //   redisDatabase.quit();
    // }

    // if (this.configService.get<string>('LDAP_REDIS_URI')) {
    //   const redisLdap = Redis.createClient({
    //     url: this.configService.get<string>('LDAP_REDIS_URI'),
    //   });

    //   try {
    //     redisLdap.flushdb();

    //     this.logger.info('Reset LDAP cache', { context: AuthService.name, ...loggerContext });

    //     ldapCacheReset = true;
    //   } catch (error) {
    //     this.logger.error(`Unable to reset LDAP cache: ${error.toString()}`, { error, context: AuthService.name, ...loggerContext });
    //   }

    //   redisLdap.quit();
    // }

    // if (this.configService.get<string>('HTTP_REDIS_URI')) {
    //   const redisHttp = Redis.createClient({
    //     url: this.configService.get<string>('HTTP_REDIS_URI'),
    //   });

    //   try {
    //     redisHttp.flushdb();

    //     this.logger.info('Reset HTTP cache', { context: AuthService.name, ...loggerContext });

    //     httpStoreReset = true;
    //   } catch (error) {
    //     this.logger.error(`Unable to reset LDAP cache: ${error.toString()}`, { error, context: AuthService.name, ...loggerContext });
    //   }

    //   redisHttp.quit();
    // }

    // try {
    //   const redisSession = Redis.createClient({
    //     url: this.configService.get<string>('SESSION_REDIS_URI'),
    //   });

    //   try {
    //     redisSession.flushdb();

    //     this.logger.info('Reset session cache', { context: AuthService.name, ...loggerContext });
    //   } catch (error) {
    //     this.logger.error(`Unable to reset session cache: ${error.toString()}`, {
    //       error,
    //       context: AuthService.name,
    //       ...loggerContext,
    //     });
    //   }

    //   redisSession.quit();

    //   sessionStoreReset = true;
    // } catch (error) {
    //   this.logger.error(`Error in cache reset, session store: ${error.toString()}`, {
    //     error,
    //     context: AuthService.name,
    //     ...loggerContext,
    //   });
    // }

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
