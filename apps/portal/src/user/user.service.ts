/** @format */

//#region Imports NPM
import { Request } from 'express';
import { Injectable, Inject, InternalServerErrorException, NotAcceptableException } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Repository, FindConditions, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { LdapResponseUser, LdapService, LDAPAddEntry } from 'nestjs-ldap';
import { compare } from 'bcrypt';
import defaultsDeep from 'lodash/defaultsDeep';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { ADMIN_GROUP, LDAP_SYNC, LDAP_SYNC_SERVICE, defaultUserSettings } from '@back/shared/constants';
import { LoginService, Profile, User, UserSettings, DefinedUserSettings, Contact, AllUsersInfo, ProfileInput } from '@lib/types';
import { constructUploads } from '@back/shared/upload';
import { ProfileEntity } from '@back/profile/profile.entity';
import { ProfileService } from '@back/profile/profile.service';
import { GroupService } from '@back/group/group.service';
import { GroupEntity } from '@back/group/group.entity';
import { PortalError } from '@back/shared/errors';
import { getUsername } from './user.decorator';
import { UserEntity } from './user.entity';
//#endregion

@Injectable()
export class UserService {
  dbCacheTtl = 10000;

  constructor(
    @Inject(LDAP_SYNC_SERVICE) private readonly client: ClientProxy,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly profileService: ProfileService,
    private readonly groupService: GroupService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly ldapService: LdapService,
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

    return compare(password, user.password) ? user : undefined;
  };

  /**
   * All users in Synchronization
   */
  allUsers = async (loginService = LoginService.LDAP, disabled = false, cache = true): Promise<AllUsersInfo[]> =>
    this.userRepository
      .find({
        where: { loginService, disabled },
        select: ['loginIdentificator', 'profile'],
        loadEagerRelations: false,
        cache,
      })
      .then((users) =>
        users.map((user) => ({
          contact: Contact.USER,
          id: user.id,
          loginIdentificator: user.loginIdentificator,
          name: user.username,
          disabled: user.disabled,
        })),
      );

  /**
   * Reads by ID
   *
   * @async
   * @method byId
   * @param {string} id User ID
   * @param {boolean} [isDisabled = true] Is this user disabled. default true.
   * @param {boolean} [isRelation = true] boolean | 'profile' | 'groups'. default true.
   * @param {boolean} [cache = true] whether to cache results. default true.
   * @returns {UserEntity} The user
   */
  byId = async (id: string, isDisabled = true, isRelations: boolean | 'profile' | 'groups' = true, cache = true): Promise<UserEntity> => {
    const where: FindConditions<UserEntity> = { id };

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOneOrFail({
      where,
      relations,
      // TODO!
      cache,
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
      cache,
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
      // TODO:
      cache,
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
    const profile = await this.profileService.fromLdap(ldapUser).catch((error: Error) => {
      this.logger.error(`Unable to save data in "profile": ${error.toString()}`, { error, context: UserService.name });

      throw error;
    });
    if (!profile) {
      this.logger.error('Unable to save data in `profile`. Unknown error.', { error: 'Unknown', context: UserService.name });

      throw new Error('Unable to save data in `profile`. Unknown error.');
    }

    // Contact
    if (!ldapUser.sAMAccountName) {
      throw new Error('sAMAccountName is missing');
    }

    const groups: GroupEntity[] | undefined = await this.groupService.fromLdapUser(ldapUser).catch((error: Error) => {
      this.logger.error(`Unable to save data in "group": ${error.toString()}`, { error, context: UserService.name });

      return undefined;
    });

    if (!user) {
      // eslint-disable-next-line no-param-reassign
      user = await this.byLoginIdentificator(ldapUser.objectGUID, false, true, false).catch((error) => {
        this.logger.error(`New user "${ldapUser.sAMAccountName}": ${error.toString()}`, { error, context: UserService.name });

        return undefined;
      });
    }
    const data = {
      ...user,
      createdAt: ldapUser.whenCreated,
      updatedAt: ldapUser.whenChanged,
      username: ldapUser.sAMAccountName,
      password: `$${LoginService.LDAP}`,
      loginService: LoginService.LDAP,
      loginIdentificator: ldapUser.objectGUID,
      // eslint-disable-next-line no-bitwise
      disabled: !!(Number.parseInt(ldapUser.userAccountControl, 10) & 2),
      groups: typeof groups !== 'undefined' ? groups : null,
      isAdmin: groups ? Boolean(groups.find((group) => group.name.toLowerCase() === ADMIN_GROUP)) : false,
      settings: user ? user.settings : defaultUserSettings,
      profile,
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
  create = (user: unknown): UserEntity => {
    if (typeof user === 'object' && user !== null) {
      return this.userRepository.create(user);
    }

    throw new Error();
  };

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
      this.logger.error(`Unable to save data(s) in "user": ${error.toString()}`, { error, context: UserService.name });

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
  save = async (userPromise: UserEntity): Promise<UserEntity> =>
    this.userRepository
      .save<UserEntity>(userPromise)
      .then((user) => {
        if (typeof user.profile === 'object' && Object.keys(user.profile).length > 1 && !user.profile.fullName) {
          const f: Array<string> = [];
          if (user.profile.lastName) {
            f.push(user.profile.lastName);
          }
          if (user.profile.firstName) {
            f.push(user.profile.firstName);
          }
          if (user.profile.middleName) {
            f.push(user.profile.middleName);
          }
          user.profile.fullName = f.join(' ');
          user.profile.contact = user.profile.username ? Contact.USER : Contact.PROFILE;
        }
        return user;
      })
      .catch((error: Error) => {
        this.logger.error(`Unable to save data in "user": ${error.toString()}`, { error, context: UserService.name });

        throw error;
      });

  /**
   * Update
   *
   * @async
   */
  update = async (
    criteria: string | string[] | number | number[] | Date | Date[] | FindConditions<UserEntity>,
    partialEntity: QueryDeepPartialEntity<UserEntity>,
  ): Promise<UpdateResult> => this.userRepository.update(criteria, partialEntity);

  /**
   * Save the settings
   *
   * @param {UserSettings} value
   * @param {User} user
   * @returns {UserSettings}
   */
  settings = (value: UserSettings, user: User): UserSettings => defaultsDeep(value, user.settings, defaultUserSettings);

  ldapCheckUsername = async (request: Request, value: string): Promise<boolean> =>
    this.ldapService
      .searchByUsername({ userByUsername: value, cache: false, loggerContext: getUsername(request) })
      .then(() => false)
      .catch(() => true);

  /**
   * This is a LDAP new user and contact
   */
  ldapNewUser = async (request: Request, value: ProfileInput, thumbnailPhoto?: Promise<FileUpload>): Promise<Profile> => {
    const entry: LDAPAddEntry = this.profileService.modification(value);
    entry.name = entry.cn;

    if (value.contact === Contact.PROFILE) {
      entry.objectClass = ['contact'];
      if (entry.sAMAccountName) {
        throw new NotAcceptableException(PortalError.USERNAME_PROFILE);
      }
    } else {
      entry.objectClass = ['user'];
      entry.userPrincipalName = `${entry.sAMAccountName}@${this.configService.get<string>('LDAP_DOMAIN')}`;
      if (!entry.sAMAccountName) {
        throw new NotAcceptableException(PortalError.USERNAME_USER);
      }
    }

    if (thumbnailPhoto) {
      await constructUploads([thumbnailPhoto], ({ file }) => {
        entry.thumbnailPhoto = file;
      });
    }

    return this.ldapService
      .add({ entry, loggerContext: getUsername(request) })
      .then<UserEntity | ProfileEntity>((ldapUser) => {
        if (!ldapUser) {
          throw new Error('Cannot contact with AD');
        }

        if (value.contact === Contact.PROFILE) {
          return this.profileService.fromLdap(ldapUser);
        }

        return this.fromLdap(ldapUser);
      })
      .then<Profile>((userProfile) => {
        if (userProfile instanceof ProfileEntity) {
          return userProfile;
        }

        return userProfile.profile;
      });
  };
}
