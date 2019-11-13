/** @format */

// #region Imports NPM
import { Injectable, HttpException, UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Response } from 'express';
// #endregion
// #region Imports Local
import { UserLogin } from '../user/models/user.dto';
import { UserService } from '../user/user.service';
import { UserEntity, UserResponse } from '../user/user.entity';
// import { LdapResponeUser } from '../ldap/interfaces/ldap.interface';
import { LogService } from '../logger/logger.service';
import { LdapService } from '../ldap/ldap.service';
import { resetSessionStore } from '../shared/session-redis';
// #endregion

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly ldapService: LdapService,
    private readonly logService: LogService,
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
  cacheReset = async (res: Response): Promise<boolean> => {
    let sessionStoreReset = false;
    let ldapCacheReset = false;

    // TODO: DATABASE_CACHE
    if (res.locals && res.locals.sessionStore) {
      try {
        sessionStoreReset = await resetSessionStore(res.locals.sessionStore);
      } catch (error) {
        this.logService.error('Error in cache reset, session store', error, 'AuthService');
      }
    }

    ldapCacheReset = await this.ldapService.cacheReset();

    if (sessionStoreReset && ldapCacheReset) {
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
        return this.userService.createLdap(ldapUser, user);
      } catch (error) {
        this.logService.error('Unable to save user', JSON.stringify(error), 'AuthService');

        throw new HttpException(this.i18n.translate('auth.LOGIN.SERVER_ERROR'), 500);
      }
    } catch (error) {
      this.logService.error('Unable to login in ldap', JSON.stringify(error), 'AuthService');

      throw new HttpException(this.i18n.translate('auth.LOGIN.INCORRECT'), 401);
    }
  }
}
