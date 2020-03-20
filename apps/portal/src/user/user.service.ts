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
import { ConfigService } from '@app/config';
import { LdapService, LdapResponseUser } from '@app/ldap';
import { LDAP_SYNC, LDAP_SYNC_SERVICE } from '../../../sync/src/app.constants';
import { UserEntity, UserResponse } from './user.entity';
import { User, UserSettings } from './models/user.dto';
import { ProfileService } from '../profile/profile.service';
import { Profile } from '../profile/models/profile.dto';
import { GroupService } from '../group/group.service';
import { LoginService } from '../shared/interfaces';
import { ADMIN_GROUP } from '../../lib/constants';
import { Group } from '../group/models/group.dto';
import { GroupEntity } from '../group/group.entity';
// #endregion

@Injectable()
export class UserService {
  dbCacheTtl = 10000;

  constructor(
    @Inject(LDAP_SYNC_SERVICE) private readonly client: ClientProxy,
    private readonly logService: LogService,
    private readonly configService: ConfigService,
    private readonly ldapService: LdapService,
    private readonly profileService: ProfileService,
    private readonly groupService: GroupService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    this.dbCacheTtl = this.configService.get<number>('DATABASE_REDIS_TTL');
  }

  /**
   * Compare password
   *
   * @param {string} username User
   * @param {string} password Password
   * @returns {UserEntity | undefined} The user
   */
  comparePassword = async (username: string, password: string): Promise<UserEntity | undefined> => {
    const user = await this.byUsername(username);

    return user?.comparePassword(password) ? user : undefined;
  };

  /**
   * Reads by ID
   *
   * @param {string} id User ID
   * @param {boolean} [isDisabled = true] Is this user disabled
   * @param {boolean} [isRelation = true] boolean | 'profile' | 'groups'
   * @param {boolean} [cache = true] whether to cache results
   * @returns {UserEntity | undefined} The user
   */
  byId = async (
    id: string,
    isDisabled = true,
    isRelations: boolean | 'profile' | 'groups' = true,
    cache = true,
  ): Promise<UserEntity | undefined> => {
    const where: Record<any, any> = { id };

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOne({
      where,
      relations,
      cache: cache ? { id: 'user_id', milliseconds: this.dbCacheTtl } : false,
    });
  };

  /**
   * Reads by Username
   *
   * @param {string} username User ID
   * @param {boolean} [isDisabled = true] Is this user disabled
   * @param {boolean | 'profile' | 'groups'} [isRelation = true] The relation of this user
   * @param {boolean} [cache = true] whether to cache results
   * @returns {UserEntity | undefined} The user
   */
  byUsername = async (
    username: string,
    isDisabled = true,
    isRelations: boolean | 'profile' | 'groups' = true,
    cache = true,
  ): Promise<UserEntity | undefined> => {
    const where: Record<any, any> = { username };

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOne({
      where,
      relations,
      cache: cache ? { id: 'user_username', milliseconds: this.dbCacheTtl } : false,
    });
  };

  /**
   * Reads by Login identificator (LDAP ObjectGUID)
   *
   * @param {string} loginIdentificator LDAP: Object GUID
   * @param {boolean} [isDisabled = true] Is this user disabled
   * @param {boolean} [isRelation = true] boolean | 'profile' | 'groups'
   * @param {boolean} [cache = true] whether to cache results
   * @returns {UserEntity | undefined} The user
   */
  byLoginIdentificator = async (
    loginIdentificator: string,
    isDisabled = true,
    isRelations: boolean | 'profile' | 'groups' = true,
    cache = true,
  ): Promise<UserEntity | undefined> => {
    const where: Record<any, any> = { loginIdentificator };

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOne({
      where,
      relations,
      cache: cache ? { id: 'user_loginIdentificator', milliseconds: this.dbCacheTtl } : false,
    });
  };

  /**
   * Create a User with Ldap params
   *
   * @param {LdapResponseUser} ldapUser Ldap user
   * @param {UserEntity} user User
   * @param {boolean} [save = true] Save the profile
   * @param {boolean} [cache = true] whether to cache results
   * @returns {Promise<UserEntity>} The return user after save
   * @throws {Error}
   */
  async createFromLdap(ldapUser: LdapResponseUser, user?: UserEntity, save = true): Promise<UserEntity> {
    const defaultSettings: UserSettings = {
      lng: 'ru',
    };

    const profile = await this.profileService
      .createFromLdap(
        ldapUser,
        user?.profile ? await this.profileService.byLoginIdentificator(ldapUser.sAMAccountName) : undefined,
        1,
        true,
      )
      .catch((error: Error) => {
        this.logService.error('Unable to save data in `profile`', error, 'UserService');

        throw error;
      });
    if (!profile) {
      this.logService.error('Unable to save data in `profile`. Unknown error.', undefined, 'UserService');

      throw new Error('Unable to save data in `profile`. Unknown error.');
    }

    // Contact
    if (!ldapUser.sAMAccountName) {
      throw new Error('sAMAccountName is missing');
    }

    const groups: GroupEntity[] | undefined = await this.groupService.createFromUser(ldapUser, false).catch((error) => {
      this.logService.error('Unable to save data in `group`', error, 'UserService');

      return undefined;
    });

    const data: User = {
      id: user?.id,
      createdAt: new Date(ldapUser.whenCreated),
      updatedAt: new Date(ldapUser.whenChanged),
      username: ldapUser.sAMAccountName,
      password: `$${LoginService.LDAP}`,
      loginService: LoginService.LDAP,
      loginIdentificator: ldapUser.objectGUID,
      // eslint-disable-next-line no-bitwise
      disabled: !!(parseInt(ldapUser.userAccountControl, 10) & 2),
      groups,
      isAdmin: groups ? Boolean(groups.find((group) => group.name.toLowerCase() === ADMIN_GROUP)) : false,
      settings: user?.settings ? user.settings : defaultSettings,
      profile: (profile as unknown) as Profile,
    };

    return save ? this.save(this.userRepository.create(data)) : this.userRepository.create(data);
  }

  /**
   * Synchronization
   *
   * @param {Request} _req Express.Request
   * @returns {Promise<boolean>} The result of synchronization
   */
  synchronization = async (_req?: Request): Promise<boolean> => this.client.send<boolean>(LDAP_SYNC, []).toPromise();

  /**
   * Create
   *
   * @param {User} user The user
   * @returns {UserEntity} The user entity
   */
  create = (user: User): UserEntity => this.userRepository.create(user);

  /**
   * Save
   *
   * @param {UserEntity[]} user The users
   * @returns {Promise<UserEntity[]>} The return users after save
   * @throws {Error} Exception
   */
  bulkSave = async (user: UserEntity[]): Promise<UserEntity[]> =>
    this.userRepository.save<UserEntity>(user).catch((error: Error) => {
      this.logService.error('Unable to save data(s) in `user`', error, 'UserService');

      throw error;
    });

  /**
   * Save
   *
   * @param {UserEntity} user The user
   * @returns {Promise<UserEntity>} The return user after save
   * @throws {Error} Exception
   */
  save = async (user: UserEntity): Promise<UserEntity> =>
    this.userRepository.save<UserEntity>(user).catch((error: Error) => {
      this.logService.error('Unable to save data in `user`', error, 'UserService');

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
      const user: UserEntity | undefined = await this.byId(req.session.passport.user.id, false, 'profile');

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
