/** @format */

// #region Imports NPM
import { Inject, forwardRef, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { UserEntity } from './user.entity';
import { UserLoginDTO, UserResponseDTO, UserRegisterDTO, LoginService, UserDTO } from './models/user.dto';
import { ConfigService } from '../config/config.service';
// eslint-disable-next-line import/no-cycle
import { AuthService } from '../auth/auth.service';
import { LdapService } from '../ldap/ldap.service';
import { LogService } from '../logger/logger.service';
import { LdapResponeUser } from '../ldap/interfaces/ldap.interface';
// #endregion

interface LdapAuthenticate {
  user: UserEntity | undefined;
  ldapUser: LdapResponeUser | undefined;
  errorCode: any;
}

@Injectable()
export class UserService {
  public ldapOnUserBeforeCreate: Function;

  public ldapOnUserAfterCreate: Function;

  public ldapOnUserBeforeUpdate: Function;

  public ldapOnUserAfterUpdate: Function;

  constructor(
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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

      const data: UserDTO = {
        username: ldapUser.sAMAccountName,
        password,
        isAdmin: false,
        email: ldapUser.mail,
        loginService: LoginService.LDAP,
        loginIdentificator: ldapUser.objectGUID.toString(),
      };

      // let comment;
      // try {
      //   comment = JSON.parse(ldapUser.comment);
      // } catch (error) {
      //   comment = {};
      // }
      // const { companyeng, nameeng, departmenteng, otdeleng, positioneng, birthday, gender } = comment;
      //   firstName: ldapUser.givenName,
      //   lastName: ldapUser.sn,
      //   middleName: ldapUser.middleName,
      //   birthday,
      //   gender: gender === 'M' ? Gender.MAN : gender === 'W' ? Gender.WOMAN : Gender.UNKNOWN,
      //   addressPersonal: JSON.stringify({
      //     postalCode: ldapUser.postalCode,
      //     region: ldapUser.st,
      //     street: ldapUser.streetAddress,
      //   }),
      //   company: ldapUser.company,
      //   title: ldapUser.title,
      //   // thumbnailPhoto: ldapUser.thumbnailPhoto,
      // };

      // #region User create/update
      if (!user) {
        const userLogin = await this.userRepository.create(data);
        try {
          await this.userRepository.save(userLogin);
        } catch (error) {
          this.logService.error('Unable to create data in `user`');
          return { user, ldapUser, errorCode: HttpStatus.INTERNAL_SERVER_ERROR };
        }
        return { user: userLogin, ldapUser, errorCode: HttpStatus.ACCEPTED };
      }

      data['id'] = user.id;
      await this.userRepository.save(data);
      // #endregion

      return {
        user,
        ldapUser,
        errorCode: HttpStatus.ACCEPTED,
      };
    } catch (error) {
      // #region If in LDAP is not found, then we compare password
      return {
        user,
        ldapUser: undefined,
        errorCode: HttpStatus.UNAUTHORIZED,
      };
      // #endregion
    }
  }

  /**
   * Login a user
   *
   * @param {UserLoginDTO} data User login data transfer object
   * @returns {UserResponseDTO} User response DTO
   */
  async login({ username, password }: UserLoginDTO): Promise<UserResponseDTO | null> {
    this.logService.debug(`UserService: user login: username = "${username}"`);

    const user = await this.userRepository.findOne({ where: { username } });
    const { user: userDB, ldapUser, errorCode } = await this.userLdapLogin({ username, password, user });

    if (errorCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      throw new HttpException(this.i18n.translate('auth.LOGIN.SERVER_ERROR'), errorCode);
    } else if (userDB === undefined || ldapUser === undefined) {
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
    let user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    // #endregion

    // #region Create user
    user = this.userRepository.create(data);
    await this.userRepository.save(user);
    // #endregion

    return user.toResponseObject(this.authService.token({ id: user.id }));
  }
}
