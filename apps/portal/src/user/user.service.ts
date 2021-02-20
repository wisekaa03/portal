/** @format */

//#region Imports NPM
import { Request } from 'express';
import { Injectable, Inject, InternalServerErrorException, NotAcceptableException, LoggerService, Logger } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository, FindConditions, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { LdapService } from 'nestjs-ldap';
import type { LoggerContext, LdapResponseUser, LDAPAddEntry } from 'nestjs-ldap';
import { compare } from 'bcrypt';
//#endregion
//#region Imports Local
import { ConfigService, LDAPDomainConfig } from '@app/config';
import { AllUsersInfo } from '@lib/types';
import { ADMIN_GROUP, LDAP_SYNC, LDAP_SYNC_SERVICE, PortalError, constructUploads, defaultUserSettings } from '@back/shared';
import { LoginService, Contact } from '@back/shared/graphql';
import { ProfileService } from '@back/profile/profile.service';
import type { ProfileInput } from '@back/profile/graphql/ProfileInput.input';
import { Profile } from '@back/profile/profile.entity';
import { GroupService } from '@back/group';
import type { Group } from '@back/group/group.entity';
import { User } from './user.entity';
//#endregion

@Injectable()
export class UserService {
  constructor(
    @Inject(LDAP_SYNC_SERVICE) private readonly client: ClientProxy,
    private readonly configService: ConfigService,
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly profileService: ProfileService,
    private readonly groupService: GroupService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly ldapService: LdapService,
  ) {}

  /**
   * Available Authentication Profiles
   * @async
   * @method availableAuthenticationProfiles
   * @returns {string[]} Profile
   * @throws {Error} Exception
   */
  public availableAuthenticationProfiles = async (synchronization: boolean, newProfile: boolean): Promise<string[]> => {
    const domainString = this.configService.get<string>('LDAP');
    let domains: Record<string, LDAPDomainConfig>;
    try {
      domains = JSON.parse(domainString);
    } catch {
      throw new Error('Not available authentication profiles.');
    }
    return Object.keys(domains).filter((domain) => {
      const sync = synchronization ? domains[domain].hideSynchronization === 'false' : true;
      const newProf = newProfile ? Boolean(domains[domain].newBase) : true;
      return sync && newProf;
    });
  };

  /**
   * Compare password
   *
   * @async
   * @method comparePassword
   * @param {string} username User
   * @param {string} password Password
   * @returns {User | undefined} The user
   */
  comparePassword = async (username: string, password: string): Promise<User | undefined> => {
    const user = await this.byUsername({ username, loggerContext: { username } });

    return compare(password, user.password) ? user : undefined;
  };

  /**
   * All users in Synchronization
   */
  allUsers = async ({
    loginService = LoginService.LDAP,
    disabled = false,
    cache = true,
    transaction = false,
    loggerContext,
  }: {
    loginService?: LoginService;
    disabled?: boolean;
    cache?: boolean;
    transaction?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<AllUsersInfo[]> =>
    this.userRepository
      .find({
        where: { loginService, disabled },
        select: ['id', 'loginDomain', 'loginGUID', 'username', 'disabled'],
        relations: [],
        loadEagerRelations: false,
        cache,
        transaction,
      })
      .then((users) =>
        users.map((user) => ({
          contact: Contact.USER,
          id: user.id,
          loginDomain: user.loginDomain,
          loginGUID: user.loginGUID,
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
   * @returns {User} The user
   */
  byId = async ({
    id,
    isDisabled = true,
    isRelations = true,
    cache = true,
    transaction = false,
    loggerContext,
  }: {
    id: string;
    isDisabled?: boolean;
    isRelations?: boolean | 'profile' | 'groups';
    cache?: boolean;
    transaction?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<User> => {
    const where: FindConditions<User> = { id };

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOneOrFail({
      where,
      relations,
      // TODO!
      cache,
      transaction,
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
   * @returns {User} The user
   */
  byUsername = async ({
    username,
    domain,
    isDisabled = true,
    isRelations = true,
    cache = true,
    transaction = false,
    loggerContext,
  }: {
    username: string;
    domain?: string | null;
    isDisabled?: boolean;
    isRelations?: boolean | 'profile' | 'groups';
    cache?: boolean;
    transaction?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<User> => {
    const where: FindConditions<User> = { username };
    if (domain) {
      where.loginService = LoginService.LDAP;
      where.loginDomain = domain;
    }

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOneOrFail({
      where,
      relations,
      cache,
      transaction,
    });
  };

  /**
   * Reads by Login identificator (LDAP ObjectGUID)
   *
   * @async
   * @param {string} loginGUID LDAP: Object GUID
   * @param {boolean} [isDisabled = true] Is this user disabled
   * @param {boolean} [isRelation = true] boolean | 'profile' | 'groups'
   * @param {boolean} [cache = true] whether to cache results
   * @returns {User | undefined} The user
   */
  byLoginGUID = async ({
    domain,
    loginGUID,
    isDisabled = true,
    isRelations = true,
    cache = true,
    transaction = false,
    loggerContext,
  }: {
    loginGUID: string;
    domain?: string | null;
    isDisabled?: boolean;
    isRelations?: boolean | 'profile' | 'groups';
    cache?: boolean;
    transaction?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<User> => {
    const where: FindConditions<User> = { loginService: LoginService.LDAP, loginGUID };
    if (domain) {
      where.loginDomain = domain;
    }

    if (isDisabled) {
      where.disabled = false;
    }

    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['profile', 'groups'] : [];

    return this.userRepository.findOneOrFail({
      where,
      relations,
      // @todo:
      cache,
      transaction,
    });
  };

  /**
   * Create a User with Ldap params
   *
   * @async
   * @param {LdapResponseUser} ldapUser Ldap user
   * @param {User} user User
   * @param {boolean} [save = true] Save the profile
   * @returns {Promise<User>} The return user after save
   * @throws {Error}
   */
  async fromLdap({
    ldapUser,
    domain,
    user,
    save = true,
    transaction = true,
    loggerContext,
  }: {
    ldapUser: LdapResponseUser;
    domain: string;
    user?: User;
    save?: boolean;
    transaction?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<User> {
    const profile = await this.profileService.fromLdap({ ldapUser, domain, loggerContext, transaction }).catch((error: Error) => {
      this.logger.error({
        message: `Unable to save data in "profile": ${error.toString()}`,
        error,
        context: UserService.name,
        function: 'fromLdap',
        ...loggerContext,
      });

      throw error;
    });
    if (!profile) {
      this.logger.error({
        message: 'Unable to save data in `profile`. Unknown error.',
        error: 'Unknown',
        context: UserService.name,
        function: 'fromLdap',
        ...loggerContext,
      });

      throw new Error('Unable to save data in `profile`. Unknown error.');
    }

    // Contact
    if (ldapUser.objectClass.includes('contact')) {
      throw new Error('This is an objectClass=contact');
    }

    const groups: Group[] | undefined = await this.groupService
      .fromLdapUser({ ldapUser, transaction, loggerContext })
      .catch((error: Error) => {
        this.logger.error({
          message: `Unable to save data in "group": ${error.toString()}`,
          error,
          context: UserService.name,
          function: 'fromLdap',
          ...loggerContext,
        });

        return undefined;
      });

    if (!user) {
      // eslint-disable-next-line no-param-reassign
      user = await this.byLoginGUID({ domain, loginGUID: ldapUser.objectGUID, isRelations: false, isDisabled: false, loggerContext }).catch(
        (error) => {
          this.logger.warn({
            message: `New user "${ldapUser.sAMAccountName}"`,
            error,
            context: UserService.name,
            function: 'fromLdap',
            ...loggerContext,
          });

          return undefined;
        },
      );
    }
    const data = {
      ...user,
      createdAt: ldapUser.whenCreated,
      updatedAt: ldapUser.whenChanged,
      username: ldapUser.sAMAccountName || ldapUser.name,
      password: `$${LoginService.LDAP}`,
      loginService: LoginService.LDAP,
      loginDomain: domain,
      loginGUID: ldapUser.objectGUID,
      // eslint-disable-next-line no-bitwise
      disabled: !!(Number.parseInt(ldapUser.userAccountControl, 10) & 2),
      groups,
      isAdmin: groups ? Boolean(groups.find((group) => group.name.toLowerCase() === ADMIN_GROUP)) : false,
      settings: user ? user.settings : defaultUserSettings,
      profile,
    };

    return save ? this.save({ user: this.userRepository.create(data), loggerContext, transaction }) : this.userRepository.create(data);
  }

  /**
   * LDAP synchronization
   *
   * @async
   * @returns {boolean} The result of synchronization
   */
  syncLdap = async ({ loggerContext }: { loggerContext?: LoggerContext }): Promise<boolean> =>
    this.client
      .send<boolean>(LDAP_SYNC, [{ loggerContext }])
      .toPromise();

  /**
   * Create
   *
   * @param {User} user The user
   * @returns {User} The user entity
   */
  create = (user: unknown): User => {
    if (typeof user === 'object' && user !== null) {
      return this.userRepository.create(user);
    }

    throw new Error();
  };

  /**
   * Save
   *
   * @async
   * @param {User[]} user The users
   * @returns {Promise<User[]>} The return users after save
   * @throws {Error} Exception
   */
  bulkSave = async ({
    user,
    loggerContext,
    transaction = true,
  }: {
    user: User[];
    loggerContext?: LoggerContext;
    transaction?: boolean;
  }): Promise<User[]> =>
    this.userRepository
      .save<User>(user, { transaction })
      .catch((error: Error) => {
        this.logger.error({
          message: `Unable to save data(s) in "user": ${error.toString()}`,
          error,
          context: UserService.name,
          function: 'bulkSave',
          ...loggerContext,
        });

        throw error;
      });

  /**
   * Save
   *
   * @async
   * @param {User} user The user
   * @param {LoggerContext} loggerContext
   * @returns {Promise<User>} The return user after save
   * @throws {Error} Exception
   */
  save = async ({
    user: userPromise,
    loggerContext,
    transaction = true,
  }: {
    user: User;
    loggerContext?: LoggerContext;
    transaction?: boolean;
  }): Promise<User> =>
    this.userRepository
      .save<User>(userPromise, { transaction })
      .then((user) => {
        if (typeof user.profile === 'object' && Object.keys(user.profile).length > 1 && !user.profile.fullName) {
          user.profile.setComputed();
        }
        return user;
      })
      .catch((error: Error) => {
        this.logger.error({
          message: `Unable to save data in "user": ${error.toString()}`,
          error,
          context: UserService.name,
          function: 'save',
          ...loggerContext,
        });

        throw error;
      });

  /**
   * Update
   *
   * @async
   */
  update = async ({
    criteria,
    partialEntity,
    loggerContext,
  }: {
    criteria: string | string[] | number | number[] | Date | Date[] | FindConditions<User>;
    partialEntity: QueryDeepPartialEntity<User>;
    loggerContext?: LoggerContext;
  }): Promise<UpdateResult> => this.userRepository.update(criteria, partialEntity);

  /**
   * Ldap check username
   *
   * @async
   */
  ldapCheckUsername = async ({
    username,
    domain,
    loggerContext,
  }: {
    username: string;
    domain: string;
    loggerContext: LoggerContext;
  }): Promise<boolean> =>
    this.ldapService
      .searchByUsername({ username, domain, cache: false, loggerContext })
      .then(() => false)
      .catch(() => true);

  /**
   * This is a LDAP new user and contact
   *
   * @async
   */
  ldapNewUser = async ({
    ldap,
    domain,
    thumbnailPhoto,
    loggerContext,
  }: {
    request: Request;
    ldap: ProfileInput;
    domain: string;
    thumbnailPhoto?: Promise<FileUpload>;
    loggerContext?: LoggerContext;
  }): Promise<Profile> => {
    const entry: LDAPAddEntry = this.profileService.modification({ profile: ldap, loggerContext });
    entry.name = entry.cn;

    if (ldap.contact === Contact.PROFILE) {
      entry.objectClass = ['contact'];
      if (entry.sAMAccountName) {
        throw new NotAcceptableException(PortalError.USERNAME_PROFILE);
      }
    } else {
      entry.objectClass = ['user'];
      entry.userPrincipalName = `${entry.sAMAccountName}@${domain}`;
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
      .add({ entry, domain, loggerContext })
      .then<User | Profile>((ldapUser) => {
        if (!ldapUser) {
          throw new Error('Cannot contact with AD');
        }

        if (ldap.contact === Contact.PROFILE) {
          return this.profileService.fromLdap({ ldapUser, domain, loggerContext });
        }

        return this.fromLdap({ ldapUser, domain, loggerContext });
      })
      .then<Profile>((userProfile) => {
        if (userProfile instanceof Profile) {
          return userProfile;
        }

        return userProfile.profile;
      });
  };
}
