/** @format */

// #region Imports NPM
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { UserEntity } from './user.entity';
import { User, UserSettings } from './models/user.dto';
import { LogService } from '../logger/logger.service';
import { LdapResponeUser } from '../ldap/interfaces/ldap.interface';
import { ProfileService } from '../profile/profile.service';
import { LdapService } from '../ldap/ldap.service';
import { Profile, LoginService } from '../profile/models/profile.dto';
// #endregion

@Injectable()
export class UserService {
  constructor(
    private readonly logService: LogService,
    private readonly ldapService: LdapService,
    private readonly profileService: ProfileService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Compare password
   *
   * @param {string} username User
   * @param {string} password Password
   * @returns {UserEntity | undefined} The user
   */
  comparePassword = async (username: string, password: string): Promise<UserEntity | undefined> => {
    const user = await this.readByUsername(username);

    if (user && user.comparePassword(password)) {
      return user;
    }

    return undefined;
  };

  /**
   * Reads by Username
   *
   * @param {string} username User ID
   * @returns {UserEntity | undefined} The user
   */
  readByUsername = async (username: string, isDisabled = true): Promise<UserEntity | undefined> => {
    const where: Record<any, any> = { username };
    if (isDisabled) {
      where.disabled = false;
    }
    return this.userRepository.findOne({
      where,
      relations: ['profile'],
      cache: true,
    });
  };

  /**
   * Reads by ID
   *
   * @param {string} id User ID
   * @returns {UserEntity | undefined} The user
   */
  readById = async (id: string, isDisabled = true): Promise<UserEntity | undefined> => {
    const where: Record<any, any> = { id };
    if (isDisabled) {
      where.disabled = false;
    }
    return this.userRepository.findOne({
      where,
      relations: ['profile'],
      cache: true,
    });
  };

  /**
   * Create a User with Ldap params
   *
   * @param {string} id - User ID
   */
  async createLdap(ldapUser: LdapResponeUser, user?: UserEntity): Promise<UserEntity | undefined> {
    let profile;

    const defaultSettings: UserSettings = {
      lng: 'ru',
      drawer: true,
    };

    try {
      profile = await this.profileService.create(ldapUser, user, 1);
    } catch (error) {
      this.logService.error('Unable to save data in `profile`', JSON.stringify(error), 'UserService');

      throw error;
    }

    if (!profile) {
      this.logService.error('Unable to save data in `profile`. Unknown error.', '', 'UserService');

      throw new Error('Unable to save data in `profile`. Unknown error.');
    }

    // Для контактов
    if (!ldapUser.sAMAccountName) {
      return undefined;
    }

    // TODO: сделать что-нибудь по поводу групп..
    const data: User = {
      id: user && user.id,
      createdAt: user && user.createdAt,
      updatedAt: user && user.updatedAt,
      username: ldapUser.sAMAccountName,
      password: `$${LoginService.LDAP}`,
      // eslint-disable-next-line no-bitwise
      disabled: !!(parseInt(ldapUser.userAccountControl, 10) & 2),
      // groups,
      isAdmin: false,
      settings: user ? user.settings : defaultSettings,
      profile: (profile as unknown) as Profile,
    };

    try {
      return this.userRepository.save(this.userRepository.create(data as User));
    } catch (error) {
      this.logService.error('Unable to save data in `user`', error.toString(), 'UserService');

      throw error;
    }
  }

  /**
   * Synchronization
   *
   * @param {req} Request
   * @returns {boolean}
   */
  async synchronization(_req: Request): Promise<boolean | null> {
    const users = await this.ldapService.synchronization();

    if (users) {
      users.forEach(async (ldapUser) => {
        const user = await this.readByUsername(ldapUser.sAMAccountName, false);

        this.createLdap(ldapUser, user).catch((error: Error) => {
          this.logService.error('Unable to save data in `synchronization`', error.toString(), 'UsersService');

          throw error;
        });
      });

      return true;
    }

    return false;
  }

  /**
   * Settings
   *
   * @param {req} Request
   * @param {string} value settings object
   * @returns {boolean}
   */
  async settings(req: Request, value: any): Promise<boolean | null> {
    const id = req && req.session && req.session.passport && req.session.passport.user.id;

    if (!id) return false;

    const user = await this.readById(id);

    if (user) {
      user.settings = { ...user.settings, ...value };
      return !!this.userRepository.save(user);
    }

    return false;
  }
}
