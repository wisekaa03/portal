/** @format */

// #region Imports NPM
import { Inject, forwardRef, Injectable, HttpException, UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
// #endregion
// #region Imports Local
import { Context } from '@nestjs/graphql';
import { UserResponse, UserLogin, UserRegister, User } from '../user/models/user.dto';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { LdapResponeUser } from '../ldap/interfaces/ldap.interface';
import { LogService } from '../logger/logger.service';
import { LdapService } from '../ldap/ldap.service';
// #endregion

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
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
  public validate = async (username: string, password: string): Promise<UserResponse | null> => {
    const user = await this.userService.comparePassword(username, password);

    if (user) {
      return user.toResponseObject('');
    }

    throw new UnauthorizedException();
  };

  /**
   * Login a user
   *
   * @param {UserLogin} data User login data transfer object
   * @returns {UserResponse} User response
   */
  async login({ username, password }: UserLogin, req: Express.Request): Promise<UserResponse | null> {
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
          return user.toResponseObject(req.sessionID || '') as UserResponse;
        } catch (error) {
          this.logService.error('Error:', JSON.stringify(error), 'AuthService');

          throw new HttpException(this.i18n.translate('auth.LOGIN.INCORRECT'), 401);
        }
      }

      this.logService.error('Error: not found user', undefined, 'AuthService');

      throw new HttpException(this.i18n.translate('auth.LOGIN.INCORRECT'), 401);
    } catch (error) {
      this.logService.error('Error:', JSON.stringify(error), 'AuthService');

      throw new HttpException(this.i18n.translate('auth.LOGIN.INCORRECT'), 401);
    }
  }

  /**
   * Logout a user
   *
   * @returns {UserResponse} User response DTO
   */
  async logout(): Promise<boolean> {
    this.logService.debug(`User logout`, 'AuthService');

    return true;
  }

  /**
   * Register a user
   *
   * @param {UserRegister} data User register data transfer object
   * @returns {UserResponse} User response DTO
   */
  async register(data: UserRegister): Promise<UserResponse | null> {
    this.logService.debug(`Register new user: ${JSON.stringify(data)}`, 'AuthService');

    // #region Check if a user exists
    // const { username } = data;
    // let user = await this.userRepository.findOne({ where: { username }, relations: ['profile'] });
    // if (user) {
    //   throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    // }
    // #endregion

    // #region Create user
    // user = this.userRepository.create(data);
    // const userDB = await this.userRepository.save(user);
    // #endregion

    // return userDB.toResponseObject(this.authService.token({ id: user.id }));

    return null;
  }

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
      const ldapUser: undefined | LdapResponeUser = await this.ldapService.authenticate(username, password);
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
