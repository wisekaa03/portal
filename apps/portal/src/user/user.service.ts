/** @format */

//#region Imports NPM
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { Repository, FindConditions } from 'typeorm';
import bcrypt from 'bcrypt';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { LdapResponseUser } from '@app/ldap';
import { TICKET_STATUSES, ADMIN_GROUP, LDAP_SYNC, LDAP_SYNC_SERVICE } from '@lib/constants';
import { LoginService, Profile, User, UserSettings } from '@lib/types';
import { ProfileService } from '@back/profile/profile.service';
import { GroupService } from '@back/group/group.service';
import { GroupEntity } from '@back/group/group.entity';
import { UserEntity } from './user.entity';
//#endregion

@Injectable()
export class UserService {
  dbCacheTtl = 10000;

  constructor(
    @Inject(LDAP_SYNC_SERVICE) private readonly client: ClientProxy,
    private readonly configService: ConfigService,
    @InjectPinoLogger(UserService.name) private readonly logger: PinoLogger,
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
   * @async
   * @method comparePassword
   * @param {string} username User
   * @param {string} password Password
   * @returns {UserEntity | undefined} The user
   */
  comparePassword = async (username: string, password: string): Promise<UserEntity | undefined> => {
    const user = await this.byUsername(username);

    return bcrypt.compare(password, user.password) ? user : undefined;
  };

  /**
   * Reads by ID
   *
   * @async
   * @method byId
   * @param {string} id User ID
   * @param {boolean} [isDisabled = true] Is this user disabled
   * @param {boolean} [isRelation = true] boolean | 'profile' | 'groups'
   * @param {boolean} [cache = true] whether to cache results
   * @returns {UserEntity} The user
   */
  byId = async (
    id: string,
    isDisabled = true,
    isRelations: boolean | 'profile' | 'groups' = true,
    cache = true,
  ): Promise<UserEntity> => {
    const where: FindConditions<UserEntity> = { id };

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOneOrFail({
      where,
      relations,
      cache: cache ? { id: `user_id_${id}`, milliseconds: this.dbCacheTtl } : false,
    });
  };

  /**
   * Reads by Username
   *
   * @async
   * @param {string} username User ID
   * @param {boolean} [isDisabled = true] Is this user disabled
   * @param {boolean | 'profile' | 'groups'} [isRelation = true] The relation of this user
   * @param {boolean} [cache = true] whether to cache results
   * @returns {UserEntity} The user
   */
  byUsername = async (
    username: string,
    isDisabled = true,
    isRelations: boolean | 'profile' | 'groups' = true,
    cache = true,
  ): Promise<UserEntity> => {
    const where: FindConditions<UserEntity> = { username };

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOneOrFail({
      where,
      relations,
      cache: cache ? { id: `user_username_${username}`, milliseconds: this.dbCacheTtl } : false,
    });
  };

  /**
   * Reads by Login identificator (LDAP ObjectGUID)
   *
   * @async
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
  ): Promise<UserEntity> => {
    const where: FindConditions<UserEntity> = { loginIdentificator };

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOneOrFail({
      where,
      relations,
      cache: cache ? { id: `user_LI_${loginIdentificator}`, milliseconds: this.dbCacheTtl } : false,
    });
  };

  /**
   * Create a User with Ldap params
   *
   * @async
   * @param {LdapResponseUser} ldapUser Ldap user
   * @param {UserEntity} user User
   * @param {boolean} [save = true] Save the profile
   * @returns {Promise<UserEntity>} The return user after save
   * @throws {Error}
   */
  async fromLdap(ldapUser: LdapResponseUser, user?: UserEntity, save = true): Promise<UserEntity> {
    const defaultSettings: UserSettings = {
      lng: 'ru',
      drawer: true,
      ticket: {
        status: TICKET_STATUSES[0],
      },
    };

    const profile = await this.profileService.fromLdap(ldapUser).catch((error: Error) => {
      this.logger.error('Unable to save data in `profile`', error);

      throw error;
    });
    if (!profile) {
      this.logger.error('Unable to save data in `profile`. Unknown error.');

      throw new Error('Unable to save data in `profile`. Unknown error.');
    }

    // Contact
    if (!ldapUser.sAMAccountName) {
      throw new Error('sAMAccountName is missing');
    }

    const groups: GroupEntity[] | undefined = await this.groupService.fromLdap(ldapUser).catch((error: Error) => {
      this.logger.error('Unable to save data in `group`', error);

      return undefined;
    });

    if (!user) {
      // eslint-disable-next-line no-param-reassign
      user = await this.byLoginIdentificator(ldapUser.objectGUID, false, false, false).catch(() => {
        this.logger.trace(`New user ${ldapUser.sAMAccountName}`);

        return undefined;
      });
    }
    const data: User = {
      ...user,
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
      settings: user ? user.settings : defaultSettings,
      profile: (profile as unknown) as Profile,
    };

    return save ? this.save(this.userRepository.create(data)) : this.userRepository.create(data);
  }

  /**
   * LDAP synchronization
   *
   * @async
   * @returns {boolean} The result of synchronization
   */
  syncLdap = async (): Promise<boolean> => this.client.send<boolean>(LDAP_SYNC, []).toPromise();

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
   * @async
   * @param {UserEntity[]} user The users
   * @returns {Promise<UserEntity[]>} The return users after save
   * @throws {Error} Exception
   */
  bulkSave = async (user: UserEntity[]): Promise<UserEntity[]> =>
    this.userRepository.save<UserEntity>(user).catch((error: Error) => {
      this.logger.error('Unable to save data(s) in `user`', error);

      throw error;
    });

  /**
   * Save
   *
   * @async
   * @param {UserEntity} user The user
   * @returns {Promise<UserEntity>} The return user after save
   * @throws {Error} Exception
   */
  save = async (user: UserEntity): Promise<UserEntity> =>
    this.userRepository.save<UserEntity>(user).catch((error: Error) => {
      this.logger.error('Unable to save data in `user`', error);

      throw error;
    });

  /**
   * Save the settings
   *
   * @param {req} Request
   * @param {string} value settings object
   * @returns {boolean}
   */
  settings(user: User, value: UserSettings): UserSettings {
    let settings = { ...user.settings };

    (Object.keys(value) as Array<keyof UserSettings>).forEach((key) => {
      if (typeof value[key] === 'object') {
        settings = {
          ...settings,
          [key]: { ...((settings[key] as unknown) as object), ...((value[key] as unknown) as object) },
        };
      } else {
        settings = { ...settings, [key]: value[key] };
      }
    });

    return settings;
  }
}
