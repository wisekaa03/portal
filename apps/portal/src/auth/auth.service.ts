/** @format */

//#region Imports NPM
import {
  Injectable,
  Inject,
  HttpService,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  LoggerService,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { LdapService, InvalidCredentialsError, LoggerContext } from 'nestjs-ldap';
// import Redis from 'ioredis';
//#endregion
//#region Imports Local
import type { EmailSession } from '@back/shared/types/interfaces';
import { ConfigService } from '@app/config';
import { UserService } from '@back/user/user.service';
import { User } from '@back/user/user.entity';
import { PortalError } from '@back/shared/errors';
import { LoginEmail } from './graphql/LoginEmail';
//#endregion

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly ldapService: LdapService,
    private readonly httpService: HttpService,
    @Inject(Logger) private readonly logger: LoggerService,
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
      const user = await this.userService.byId({
        id: request.user.id,
        loggerContext: { username: request.user.username, headers: request.headers },
      });

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
   * @returns {User} User entity
   * @throws {Error} Exception
   */
  async login({
    username,
    password,
    domain,
    loggerContext,
  }: {
    username: string;
    password: string;
    domain: string;
    loggerContext: LoggerContext;
  }): Promise<User> {
    if (!domain) {
      throw new UnauthorizedException('Domain is not exist');
    }

    this.logger.log({
      message: `User login: domain="${domain}", username="${username}"`,
      context: AuthService.name,
      function: this.login.name,
      ...loggerContext,
    });

    const ldapUser = await this.ldapService
      .authenticate({ username, password, domain, loggerContext })
      .catch((error: Error | InvalidCredentialsError) => {
        this.logger.error({
          message: `LDAP login in ${domain}: ${error.toString()}`,
          error,
          context: AuthService.name,
          function: this.login.name,
          ...loggerContext,
        });

        if (error instanceof InvalidCredentialsError) {
          throw new UnauthorizedException(__DEV__ ? error : undefined);
        }

        throw new BadRequestException(__DEV__ ? error : undefined);
      });

    return this.userService
      .fromLdap({ ldapUser, domain, loggerContext })
      .then((user) => {
        if (user.disabled) {
          this.logger.error({
            message: `User is Disabled in domain ${domain}: ${user.username}`,
            error: 'User is Disabled',
            context: AuthService.name,
            function: this.login.name,
            ...loggerContext,
          });

          throw new BadRequestException(PortalError.USER_DISABLED);
        }

        return user;
      })
      .catch((error: Error) => {
        this.logger.error({
          message: `Error: not found user in domain ${domain}: ${error.toString()}`,
          error,
          context: AuthService.name,
          function: this.login.name,
          ...loggerContext,
        });

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

    //     this.logger.info('Reset database cache', { context: AuthService.name, function: 'cacheReset', ...loggerContext });

    //     databaseStoreReset = true;
    //   } catch (error) {
    //     this.logger.error(`Unable to reset database cache: ${error.toString()}`, {
    //       error,
    //       context: AuthService.name, function: 'cacheReset',
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

    //     this.logger.info('Reset LDAP cache', { context: AuthService.name, function: 'cacheReset', ...loggerContext });

    //     ldapCacheReset = true;
    //   } catch (error) {
    //     this.logger.error(`Unable to reset LDAP cache: ${error.toString()}`,
    //     { error, context: AuthService.name, function: 'cacheReset', ...loggerContext });
    //   }

    //   redisLdap.quit();
    // }

    // if (this.configService.get<string>('HTTP_REDIS_URI')) {
    //   const redisHttp = Redis.createClient({
    //     url: this.configService.get<string>('HTTP_REDIS_URI'),
    //   });

    //   try {
    //     redisHttp.flushdb();

    //     this.logger.info('Reset HTTP cache', { context: AuthService.name, function: 'cacheReset', ...loggerContext });

    //     httpStoreReset = true;
    //   } catch (error) {
    //     this.logger.error(`Unable to reset LDAP cache: ${error.toString()}`,
    //     { error, context: AuthService.name, function: 'cacheReset', ...loggerContext });
    //   }

    //   redisHttp.quit();
    // }

    // try {
    //   const redisSession = Redis.createClient({
    //     url: this.configService.get<string>('SESSION_REDIS_URI'),
    //   });

    //   try {
    //     redisSession.flushdb();

    //     this.logger.log({ message: 'Reset session cache', context: AuthService.name, function: 'cacheReset', ...loggerContext });
    //   } catch (error) {
    //     this.logger.error({message: `Unable to reset session cache: ${error.toString()}`,
    //       error, function: 'cacheReset',
    //       context: AuthService.name,
    //       ...loggerContext,
    //     });
    //   }

    //   redisSession.quit();

    //   sessionStoreReset = true;
    // } catch (error) {
    //   this.logger.error({message: `Error in cache reset, session store: ${error.toString()}`,
    //     error, function: 'cacheReset',
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
