/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { UserEntity } from './user.entity';
import { User } from './models/user.dto';
import { LogService } from '../logger/logger.service';
import { LdapResponeUser } from '../ldap/interfaces/ldap.interface';
import { ProfileService } from '../profile/profile.service';
import { LoginService } from '../../lib/types';
// #endregion

@Injectable()
export class UserService {
  constructor(
    private readonly logService: LogService,
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
  async readByUsername(username: string): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({
      where: { username },
      relations: ['profile'],
      cache: true,
    });
  }

  /**
   * Reads by ID
   *
   * @param {string} id User ID
   * @returns {UserEntity | undefined} The user
   */
  async readById(id: string): Promise<UserEntity | undefined> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
      cache: true,
    });
  }

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

    // TODO: сделать что-нибудь по поводу групп..
    const data: User = {
      id: user && user.id,
      createdAt: user && user.createdAt,
      updatedAt: user && user.updatedAt,
      username: ldapUser.sAMAccountName,
      password: `$${LoginService.LDAP}`,
      // groups,
      isAdmin: false,
      profile,
    };

    try {
      return this.userRepository.save(this.userRepository.create(data as User));
    } catch (error) {
      this.logService.error('Unable to save data in `user`', JSON.stringify(error), 'UserService');

      throw error;
    }
  }
}
