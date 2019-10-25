/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { UserEntity } from './user.entity';
import { User } from './models/user.dto';
import { LogService } from '../logger/logger.service';
import { LdapResponeUser } from '../ldap/interfaces/ldap.interface';
import { ProfileService } from '../profile/profile.service';
import { LoginService } from '../../lib/types';
import { LdapService } from '../ldap/ldap.service';
import { Profile } from '../profile/models/profile.dto';
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
   * Reads by Username
   *
   * @param {string} username User ID
   * @returns {UserEntity | undefined} The user
   */
  readByUsername = async (username: string, byDisabled = true): Promise<UserEntity | undefined> =>
    this.userRepository.findOne({
      where: { username, disabled: byDisabled ? false : undefined },
      relations: ['profile'],
      cache: true,
    });

  /**
   * Reads by ID
   *
   * @param {string} id User ID
   * @returns {UserEntity | undefined} The user
   */
  readById = async (id: string, byDisabled = true): Promise<UserEntity | undefined> =>
    this.userRepository.findOne({
      where: { id, disabled: byDisabled ? false : undefined },
      relations: ['profile'],
      cache: true,
    });

  /**
   * Create a User with Ldap params
   *
   * @param {string} id - User ID
   */
  async createLdap(ldapUser: LdapResponeUser, user?: UserEntity): Promise<UserEntity | undefined> {
    let profile;

    try {
      profile = await this.profileService.create(ldapUser, user);
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
      profile: (profile as unknown) as Profile,
    };

    try {
      return this.userRepository.save(this.userRepository.create(data as User));
    } catch (error) {
      this.logService.error('Unable to save data in `user`', JSON.stringify(error), 'UserService');

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
}
