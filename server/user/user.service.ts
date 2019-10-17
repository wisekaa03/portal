/** @format */

// #region Imports NPM
import { Inject, forwardRef, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { UserEntity } from './user.entity';
import { UserLoginDTO, UserResponseDTO, UserRegisterDTO, UserDTO } from './models/user.dto';
import { ConfigService } from '../config/config.service';
// eslint-disable-next-line import/no-cycle
import { AuthService } from '../auth/auth.service';
import { LdapService } from '../ldap/ldap.service';
import { LogService } from '../logger/logger.service';
import { LdapResponeUser } from '../ldap/interfaces/ldap.interface';
import { ProfileService } from '../profile/profile.service';
import { ProfileDTO } from '../profile/models/profile.dto';
import { LoginService } from '../../lib/types';
// #endregion

interface LdapAuthenticate {
  user: UserEntity | void;
  ldapUser?: LdapResponeUser;
  profile: ProfileDTO | void;
  errorCode: any;
}

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly profileService: ProfileService,
    private readonly ldapService: LdapService,
    private readonly logService: LogService,
  ) {}

  /**
   * This is a call from authService.validate
   *
   * @param id - User ID
   */
  async read(id: string): Promise<UserResponseDTO | null> {
    const user = (await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    })) as UserEntity;

    if (!user) {
      return null;
    }

    return user.toResponseObject(this.authService.token({ id: user.id }));
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
  }): Promise<LdapAuthenticate> {
    try {
      // #region to LDAP database
      const ldapUser: LdapResponeUser = await this.ldapService.authenticate(username, password);
      // #endregion

      try {
        // #region User create/update
        if (!user) {
          let userLogin;
          const profile = await this.profileService.create(ldapUser);

          // eslint-disable-next-line no-debugger
          debugger;

          const data: UserDTO = {
            username: ldapUser.sAMAccountName,
            password: `$${LoginService.LDAP}`,
            // groups,
            isAdmin: false,
            profile,
          };

          try {
            userLogin = await this.userRepository.save(this.userRepository.create(data));
          } catch (error) {
            this.logService.error('Unable to create data in `user`', error);

            return { user, profile, ldapUser, errorCode: HttpStatus.INTERNAL_SERVER_ERROR };
          }

          return { user: userLogin, profile, ldapUser, errorCode: HttpStatus.ACCEPTED };
        }

        return {
          user,
          profile: user.profile,
          ldapUser,
          errorCode: HttpStatus.ACCEPTED,
        };
      } catch (error) {
        this.logService.error('Unable to create data in `profile`', error);

        return { user, profile: undefined, ldapUser, errorCode: HttpStatus.INTERNAL_SERVER_ERROR };
      }
    } catch (error) {
      this.logService.error('Unable to save in user database', error);

      return {
        user,
        profile: undefined,
        ldapUser: undefined,
        errorCode: HttpStatus.UNAUTHORIZED,
      };
    }
  }

  /**
   * Login a user
   *
   * @param {UserLoginDTO} data User login data transfer object
   * @returns {UserResponseDTO} User response DTO
   */
  async login({ username, password }: UserLoginDTO): Promise<UserResponseDTO> {
    this.logService.debug(`UserService: user login: username = "${username}"`);

    const user = await this.userRepository.findOne({ where: { username }, relations: ['profile'] });
    const { user: userDB, ldapUser, profile, errorCode } = await this.userLdapLogin({ username, password, user });

    if (errorCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      throw new HttpException(this.i18n.translate('auth.LOGIN.SERVER_ERROR'), errorCode);
    } else if (userDB === undefined || ldapUser === undefined || profile === undefined) {
      throw new HttpException(this.i18n.translate('auth.LOGIN.INCORRECT'), errorCode);
    }

    return userDB.toResponseObject(this.authService.token({ id: userDB.id }));
  }

  /**
   * Logout a user
   *
   * @returns {UserResponseDTO} User response DTO
   */
  async logout(): Promise<boolean> {
    this.logService.debug(`UserService: user logout`);

    // eslint-disable-next-line no-debugger
    debugger;

    return true;
  }

  /**
   * Register a user
   *
   * @param {UserRegisterDTO} data User register data transfer object
   * @returns {UserResponseDTO} User response DTO
   */
  async register(data: UserRegisterDTO): Promise<UserResponseDTO | null> {
    this.logService.debug(`UserService: register new user: ${JSON.stringify(data)}`);

    // #region Check if a user exists
    const { username } = data;
    let user = await this.userRepository.findOne({ where: { username }, relations: ['profile'] });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    // #endregion

    // #region Create user
    user = this.userRepository.create(data);
    const userDB = await this.userRepository.save(user);
    // #endregion

    return userDB.toResponseObject(this.authService.token({ id: user.id }));
  }
}
