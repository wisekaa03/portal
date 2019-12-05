/** @format */

// #region Imports NPM
import { Injectable, HttpException, UnauthorizedException, HttpService } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import Redis from 'redis';
import { Response } from 'express';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapService } from '@app/ldap';
import { ConfigService } from '@app/config';
import { UserLogin } from '../user/models/user.dto';
import { UserService } from '../user/user.service';
import { UserEntity, UserResponse } from '../user/user.entity';
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
   * @param {username} Username
   * @returns {UserRespone | null}
   */
  public validate = async (username: string, password: string, req?: Express.Request): Promise<UserResponse | null> => {
    // TODO: сделать что-нибудь... постоянно опрашивается и база и ldap, согласно политики redis-а
    // TODO: опрашивается redis, но у него есть время на удаление всех записей, настраивается через
    // TODO: у базы - DATABASE_REDIS_TTL, у ldap - LDAP_REDIS_TTL
    const user = await this.userService.comparePassword(username, password);

    if (user) {
      return user.toResponseObject((req && req.sessionID) || '');
    }

    throw new UnauthorizedException();
  };

  /**
   * Login a user
   *
   * @param {UserLogin} data User login data transfer object
   * @returns {UserResponse} User response
   */
  async login({ username, password }: UserLogin, req?: Express.Request): Promise<UserResponse | null> {
    this.logService.debug(`User login: username = "${username}"`, 'AuthService');

    try {
      const user = await this.userLdapLogin({
        username,
        password,
        user: await this.userService.readByUsername(username),
      });
      if (user) {
        try {
          // TODO:
          return user.toResponseObject((req && req.sessionID) || '');
        } catch (error) {
          this.logService.error('Error:', error.toString(), 'AuthService');

          throw new HttpException(this.i18n.translate('auth.LOGIN.INCORRECT'), 401);
        }
      }

      this.logService.error('Error: not found user', undefined, 'AuthService');

      throw new HttpException(this.i18n.translate('auth.LOGIN.INCORRECT'), 401);
    } catch (error) {
      this.logService.error('Error:', error.toString(), 'AuthService');

      throw new HttpException(this.i18n.translate('auth.LOGIN.INCORRECT'), 401);
    }
  }

  /**
   * User LDAP login
   *
   */
  cacheReset = async (): Promise<boolean> => {
    let sessionStoreReset = false;
    let databaseStoreReset = false;
    let ldapCacheReset = false;

    if (this.configService.get<string>('DATABASE_REDIS_HOST')) {
      const redisDatabase = Redis.createClient({
        host: this.configService.get<string>('DATABASE_REDIS_HOST'),
        port: this.configService.get<number>('DATABASE_REDIS_PORT'),
        password: this.configService.get<string>('DATABASE_REDIS_PASSWORD') || undefined,
        db: this.configService.get<number>('DATABASE_REDIS_DB'),
        prefix: this.configService.get<string>('DATABASE_REDIS_PREFIX'),
      });

      try {
        redisDatabase.flushdb();

        this.logService.log('Reset database cache.', 'AuthService');

        databaseStoreReset = true;
      } catch (error) {
        this.logService.error('Unable to reset database cache:', error, 'AuthService');
      }

      redisDatabase.quit();
    }

    if (this.configService.get<string>('LDAP_REDIS_HOST')) {
      const redisLdap = Redis.createClient({
        host: this.configService.get<string>('LDAP_REDIS_HOST'),
        port: this.configService.get<number>('LDAP_REDIS_PORT'),
        password: this.configService.get<string>('LDAP_REDIS_PASSWORD') || undefined,
        db: this.configService.get<number>('LDAP_REDIS_DB'),
      });

      try {
        redisLdap.flushdb();

        this.logService.log('Reset LDAP cache.', 'AuthService');

        ldapCacheReset = true;
      } catch (error) {
        this.logService.error('Unable to reset LDAP cache:', error, 'AuthService');
      }

      redisLdap.quit();
    }

    try {
      const redisSession = Redis.createClient({
        host: this.configService.get<string>('SESSION_REDIS_HOST'),
        port: this.configService.get<number>('SESSION_REDIS_PORT'),
        password: this.configService.get<string>('SESSION_REDIS_PASSWORD') || undefined,
        db: this.configService.get<number>('SESSION_REDIS_DB'),
        prefix: this.configService.get<string>('SESSION_REDIS_PREFIX') || 'SESSION',
      });

      try {
        redisSession.flushdb();

        this.logService.log('Reset session cache.', 'AuthService');
      } catch (error) {
        this.logService.error('Unable to reset session cache:', error, 'AuthService');
      }

      redisSession.quit();

      sessionStoreReset = true;
    } catch (error) {
      this.logService.error('Error in cache reset, session store', error, 'AuthService');
    }

    if (databaseStoreReset && sessionStoreReset && ldapCacheReset) {
      return true;
    }

    return false;
  };

  /**
   * User LDAP login
   *
   * @param {string, string, UserEntity} - User register data transfer object
   * @returns {UserEntity} User response DTO
   */
  async userLdapLogin({
    username,
    password,
    user,
  }: {
    username: string;
    password: string;
    user?: UserEntity;
  }): Promise<UserEntity | undefined> {
    try {
      // #region to LDAP database
      const ldapUser = await this.ldapService.authenticate(username, password);
      // #endregion

      if (!ldapUser) {
        this.logService.error('Unable to find user in ldap', undefined, 'AuthService');

        return undefined;
      }

      try {
        return this.userService.createFromLdap(ldapUser, user);
      } catch (error) {
        this.logService.error('Unable to save user', JSON.stringify(error), 'AuthService');

        throw new HttpException(this.i18n.translate('auth.LOGIN.SERVER_ERROR'), 500);
      }
    } catch (error) {
      this.logService.error('Unable to login in ldap', JSON.stringify(error), 'AuthService');

      throw new HttpException(this.i18n.translate('auth.LOGIN.INCORRECT'), 401);
    }
  }

  loginEmail = async (email: string, password: string, res: Response): Promise<void> => {
    const mailSession = (
      await this.httpService
        .post(this.configService.get<string>('MAIL_LOGIN_URL'), {
          email,
          password,
        })
        .toPromise()
    ).data;

    if (mailSession.sessid && mailSession.sessauth) {
      const maxAge = parseInt(this.configService.get<string>('SESSION_COOKIE_TTL'), 10) / 1000;
      const options = { httpOnly: true, path: '/', maxAge };

      res.cookie('roundcube_sessid', mailSession.sessid, options);
      res.cookie('roundcube_sessauth', mailSession.sessauth, options);
    }
  };
}
