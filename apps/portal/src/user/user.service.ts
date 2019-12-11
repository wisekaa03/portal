/** @format */

// #region Imports NPM
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy, Transport, ClientNats } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapService, LdapResponseUser } from '@app/ldap';
import { SYNCHRONIZATION_SERVICE, SYNCHRONIZATION } from '../../../synch/src/app.constants';
import { SOAP1C } from '../../../soap1c/src/app.constants';
import { UserEntity } from './user.entity';
import { User, UserSettings } from './models/user.dto';
import { ProfileService } from '../profile/profile.service';
import { Profile } from '../profile/models/profile.dto';
import { GroupService } from '../group/group.service';
import { GroupEntity } from '../group/group.entity';
import { ProfileEntity } from '../profile/profile.entity';
import { LoginService } from '../shared/interfaces';
// #endregion

@Injectable()
export class UserService {
  constructor(
    @Inject(SYNCHRONIZATION_SERVICE) private readonly client: ClientProxy,
    private readonly logService: LogService,
    private readonly ldapService: LdapService,
    private readonly profileService: ProfileService,
    private readonly groupService: GroupService,
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
      relations: ['profile', 'groups'],
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
      relations: ['profile', 'groups'],
      cache: true,
    });
  };

  /**
   * Create a User with Ldap params
   *
   * @param {string} id - User ID
   */
  async createFromLdap(ldapUser: LdapResponseUser, user?: UserEntity): Promise<UserEntity | undefined> {
    let profile: ProfileEntity | undefined;
    let groups: GroupEntity[];

    const defaultSettings: UserSettings = {
      lng: 'ru',
    };

    try {
      profile = await this.profileService.createFromLdap(ldapUser, user);
    } catch (error) {
      this.logService.error('Unable to save data in `profile`', JSON.stringify(error), 'UserService');

      throw error;
    }

    if (!profile) {
      this.logService.error('Unable to save data in `profile`. Unknown error.', undefined, 'UserService');

      throw new Error('Unable to save data in `profile`. Unknown error.');
    }

    try {
      groups = await this.groupService.createFromUser(ldapUser);
    } catch (error) {
      this.logService.error('Unable to save data in `group`', JSON.stringify(error), 'UserService');

      throw error;
    }

    if (!groups) {
      this.logService.error('Unable to save data in `group`. Unknown error.', undefined, 'UserService');

      throw new Error('Unable to save data in `group`. Unknown error.');
    }

    // Для контактов
    if (!ldapUser.sAMAccountName) {
      return undefined;
    }

    // TODO: временное решение
    const admins = ['r.tikhiy', 'stas'];

    // TODO: сделать что-нибудь по поводу групп..
    const data: User = {
      id: user && user.id,
      createdAt: user && user.createdAt,
      updatedAt: user && user.updatedAt,
      username: ldapUser.sAMAccountName,
      password: `$${LoginService.LDAP}`,
      // eslint-disable-next-line no-bitwise
      disabled: !!(parseInt(ldapUser.userAccountControl, 10) & 2),
      groups,
      isAdmin: admins.includes(ldapUser.sAMAccountName),
      settings: user && user.settings ? user.settings : defaultSettings,
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
  synchronization = async (_req: Request): Promise<boolean | null> =>
    this.client.send<boolean>(SYNCHRONIZATION, []).toPromise();

  /**
   * Synchronization
   *
   * @param {req} Request
   * @returns {boolean}
   */
  soap1csynch = async (_req: Request): Promise<boolean | null> => this.client.send<boolean>(SOAP1C, []).toPromise();

  /**
   * Settings
   *
   * @param {req} Request
   * @param {string} value settings object
   * @returns {boolean}
   */
  async settings(req: Request, value: any): Promise<User | boolean> {
    if (req && req.session && req.session.passport && req.session.passport.user && req.session.passport.user.id) {
      const user: UserEntity | undefined = await this.readById(req.session.passport.user.id);

      if (user) {
        user.settings = { ...user.settings, ...value };
        req.session.passport.user = user;
        this.userRepository.save(user);

        return user as User;
      }
    }

    return false;
  }
}
