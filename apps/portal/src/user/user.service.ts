/** @format */

// #region Imports NPM
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapService, LdapResponseUser } from '@app/ldap';
import { SYNCHRONIZATION_SERVICE, SYNCHRONIZATION } from '../../../synch/src/app.constants';
import { UserEntity, UserResponse } from './user.entity';
import { User, UserSettings } from './models/user.dto';
import { ProfileService } from '../profile/profile.service';
import { Profile } from '../profile/models/profile.dto';
import { GroupService } from '../group/group.service';
import { LoginService } from '../shared/interfaces';
import { ADMIN_GROUP } from '../../lib/constants';
import { Group } from '../group/models/group.dto';
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

    return user?.comparePassword(password) ? user : undefined;
  };

  /**
   * Reads by Username
   *
   * @param {string} username User ID
   * @returns {UserEntity | undefined} The user
   */
  readByUsername = async (
    username: string,
    isDisabled = true,
    isRelations: boolean | 'profile' | 'groups' = true,
  ): Promise<UserEntity | undefined> => {
    const where: Record<any, any> = { username };

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOne({
      where,
      relations,
      cache: true,
    });
  };

  /**
   * Reads by ID
   *
   * @param {string} id User ID
   * @returns {UserEntity | undefined} The user
   */
  readById = async (
    id: string,
    isDisabled = true,
    isRelations: boolean | 'profile' | 'groups' = true,
  ): Promise<UserEntity | undefined> => {
    const where: Record<any, any> = { id };

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOne({
      where,
      relations,
      cache: true,
    });
  };

  /**
   * Create a User with Ldap params
   *
   * @param {string} id - User ID
   * @throws {Error}
   */
  async createFromLdap(ldapUser: LdapResponseUser, user?: UserEntity): Promise<UserEntity> {
    const defaultSettings: UserSettings = {
      lng: 'ru',
    };

    const profile = await this.profileService.createFromLdap(ldapUser, user).catch((error: Error) => {
      this.logService.error('Unable to save data in `profile`', JSON.stringify(error), 'UserService');

      throw error;
    });

    if (!profile) {
      this.logService.error('Unable to save data in `profile`. Unknown error.', undefined, 'UserService');

      throw new Error('Unable to save data in `profile`. Unknown error.');
    }

    // Для контактов
    if (!ldapUser.sAMAccountName) {
      throw new Error('sAMAccountName is missing');
    }

    const groups = await this.groupService.createFromUser(ldapUser).catch((error) => {
      this.logService.error('Unable to save data in `group`', JSON.stringify(error), 'UserService');

      // throw error;
    });

    // TODO: fck
    // if (!groups) {
    //   this.logService.error('Unable to save data in `group`. Unknown error.', undefined, 'UserService');

    //   throw new Error('Unable to save data in `group`. Unknown error.');
    // }

    const data: User = {
      id: user?.id,
      createdAt: new Date(ldapUser.whenCreated),
      updatedAt: new Date(ldapUser.whenChanged),
      username: ldapUser.sAMAccountName,
      password: `$${LoginService.LDAP}`,
      // eslint-disable-next-line no-bitwise
      disabled: !!(parseInt(ldapUser.userAccountControl, 10) & 2),
      groups: groups as Group[],
      isAdmin: groups ? Boolean(groups.find((group) => group.name === ADMIN_GROUP)) : false,
      settings: user?.settings ? user.settings : defaultSettings,
      profile: (profile as unknown) as Profile,
    };

    return this.save(this.create(data));
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
   * Create
   *
   * @param {User} The user
   * @returns {UserEntity} The user entity
   */
  create = (user: User): UserEntity => this.userRepository.create(user);

  /**
   * Save
   *
   * @param {UserEntity[]} - The users
   * @returns {UserEntity[]} - The users
   * @throws {Error} - Exception
   */
  bulkSave = async (user: UserEntity[]): Promise<UserEntity[]> =>
    this.userRepository.save<UserEntity>(user).catch((error: Error) => {
      this.logService.error('Unable to save data(s) in `user`', JSON.stringify(error), 'UserService');

      throw error;
    });

  /**
   * Save
   *
   * @param {UserEntity} - The user
   * @returns {UserEntity} - The user
   * @throws {Error} - Exception
   */
  save = async (user: UserEntity): Promise<UserEntity> =>
    this.userRepository.save<UserEntity>(user).catch((error: Error) => {
      this.logService.error('Unable to save data in `user`', JSON.stringify(error), 'UserService');

      throw error;
    });

  /**
   * Settings
   *
   * @param {req} Request
   * @param {string} value settings object
   * @returns {boolean}
   */
  async settings(req: Request, value: UserSettings): Promise<UserResponse | boolean> {
    if (req && req.session && req.session.passport && req.session.passport.user && req.session.passport.user.id) {
      const user: UserEntity | undefined = await this.readById(req.session.passport.user.id, false, 'profile');

      if (user) {
        let newSettings = { ...user.settings };

        (Object.keys(value) as Array<keyof UserSettings>).forEach((key) => {
          if (typeof value[key] === 'object') {
            newSettings = {
              ...newSettings,
              [key]: { ...((newSettings[key] as unknown) as object), ...((value[key] as unknown) as object) },
            };
          } else {
            newSettings = { ...newSettings, [key]: value[key] };
          }
        });

        user.settings = newSettings;
        this.save(user);

        (user as UserResponse).passwordFrontend = req.session.passport.user.passwordFrontend;
        req.session.passport.user = user;

        return user as UserResponse;
      }
    }

    return false;
  }
}
