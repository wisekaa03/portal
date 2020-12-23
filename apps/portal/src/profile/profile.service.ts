/** @format */

//#region Imports NPM
import {
  Injectable,
  Inject,
  PayloadTooLargeException,
  BadRequestException,
  ForbiddenException,
  UnprocessableEntityException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder, FindConditions, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import type { FileUpload } from 'graphql-upload';
import { LdapService, Change, Attribute, NoSuchObjectError, InsufficientAccessRightsError } from 'nestjs-ldap';
import type { LoggerContext, LdapResponseUser, LDAPAddEntry, LdapError } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { PROFILE_TYPE } from '@lib/types/profile';
import type { AllUsersInfo } from '@lib/types';
import { LoginService, Contact, Gender } from '@back/shared/graphql';
import { constructUploads, PortalError } from '@back/shared';
import { ConfigService } from '@app/config';
import { ImageService } from '@app/image';
import { User } from '@back/user/user.entity';
import { UserSettingsPhonebookFilterInput } from '@back/user/graphql/UserSettingsPhonebookFilter.input';
import { ProfileInput, SearchSuggestions, PhonebookColumnNames } from './graphql';
import { Profile } from './profile.entity';
//#endregion

@Injectable()
export class ProfileService {
  dbCacheTtl = 10000;

  locale = undefined;

  format = {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    // hour: '2-digit',
    // minute: '2-digit',
    // second: '2-digit',
  };

  clean = (value: string | number | boolean | unknown): string | number | boolean | unknown =>
    // TODO: продумать варианты очистки и безопасности
    typeof value === 'string' ? value.trim() : value;

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly configService: ConfigService,
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly imageService: ImageService,
    private readonly ldapService: LdapService,
  ) {
    this.dbCacheTtl = this.configService.get<number>('DATABASE_REDIS_TTL');
  }

  /**
   * All profiles in Synchronization
   *
   * @async
   */
  allProfiles = async ({
    loginService = LoginService.LDAP,
    disabled = false,
    cache = true,
    loggerContext,
  }: {
    loginService?: LoginService;
    disabled?: boolean;
    cache?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<AllUsersInfo[]> =>
    this.profileRepository
      .find({
        where: { loginService, disabled },
        select: ['id', 'loginDomain', 'loginGUID', 'username', 'disabled'],
        relations: [],
        loadEagerRelations: false,
        cache,
      })
      .then((profile) =>
        profile.map((p) => ({
          contact: Contact.PROFILE,
          id: p.id,
          loginDomain: p.loginDomain,
          loginGUID: p.loginGUID,
          name: p.username,
          disabled: p.disabled,
        })),
      );

  /**
   * Get profiles
   *
   * @param {string} string The search string
   * @param {boolean} disabled The disabled flag
   * @param {boolean} notShowing The not showing flag
   * @return {SelectQueryBuilder<Profile>}
   */
  getProfiles = ({
    search,
    disabled,
    notShowing,
    filters = [],
    loggerContext,
  }: {
    search?: string;
    disabled?: boolean;
    notShowing?: boolean;
    filters: UserSettingsPhonebookFilterInput[];
    loggerContext?: LoggerContext;
  }): SelectQueryBuilder<PROFILE_TYPE> => {
    const query = this.profileRepository.createQueryBuilder('profile').leftJoinAndSelect('profile.manager', 'manager');

    const parameters: Record<string, boolean | string | undefined> = { notShowing, disabled };

    if (!disabled) {
      query.andWhere('profile.disabled = :disabled');
    }

    if (!notShowing) {
      query.andWhere('profile.notShowing = :notShowing');
    }

    if (filters) {
      filters.forEach((filter) => {
        if (filter.name && filter.name.search(/(disabled)|(notShowing)/g) < 0) {
          parameters[filter.name] = filter.value;
          query.andWhere(`profile.${filter.name} = :${filter.name}`);
        }
      });
    }

    search?.split('+').forEach((value) => {
      const cleared = value.trim() !== '' ? `'%${value.trim()}%'` : '';

      if (cleared) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where(`profile.lastName || ' ' || profile.firstName || ' ' || profile.middleName iLike ${cleared}`)
              .orWhere(`profile.username iLike ${cleared}`)
              .orWhere(`profile.company iLike ${cleared}`)
              .orWhere(`profile.management iLike ${cleared}`)
              .orWhere(`profile.department iLike ${cleared}`)
              .orWhere(`profile.division iLike ${cleared}`)
              .orWhere(`profile.title iLike ${cleared}`)
              .orWhere(`profile.telephone iLike ${cleared}`)
              .orWhere(`profile.workPhone iLike ${cleared}`)
              .orWhere(`profile.city iLike ${cleared}`)
              .orWhere(`profile.mobile iLike ${cleared}`);
          }),
        );
      }
    });

    return query.setParameters(parameters).cache(true);
  };

  /**
   * Profile by ID
   *
   * @async
   * @method byId
   * @param {string} id ID of profile
   * @param {boolean} cache From cache
   * @return {Promise<Profile | undefined>} Profile
   */
  byId = async ({
    id,
    isRelations = true,
    cache = true,
    transaction = false,
    loggerContext,
  }: {
    id: string;
    isRelations?: boolean | 'manager';
    cache?: boolean;
    transaction?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<Profile | undefined> => {
    const where: FindConditions<Profile> = { id };
    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['manager'] : [];

    return this.profileRepository
      .findOne({
        where,
        relations,
        // TODO:
        cache,
        transaction,
      })
      .then((value) => {
        const valueTrimmed = value;

        if (valueTrimmed) {
          valueTrimmed.workPhone = valueTrimmed.workPhone?.trim() ?? '';
          valueTrimmed.email = valueTrimmed.email?.trim() ?? '';
          valueTrimmed.management = valueTrimmed.management?.trim() ?? '';
        }

        return valueTrimmed;
      });
  };

  /**
   * Profile by username
   *
   * @async
   * @param {string} username Username
   * @param {boolean} cache From cache
   * @return {Promise<Profile | undefined>} Profile
   */
  byUsername = async ({
    username,
    domain,
    isRelations = true,
    cache = true,
    transaction = false,
    loggerContext,
  }: {
    username: string;
    domain?: string | null;
    isRelations: boolean | 'manager';
    cache: boolean;
    transaction: boolean;
    loggerContext?: LoggerContext;
  }): Promise<Profile | undefined> => {
    const where: FindConditions<Profile> = { username };
    if (domain) {
      where.loginService = LoginService.LDAP;
      where.loginDomain = domain;
    }
    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['manager'] : [];

    return this.profileRepository.findOne({
      where,
      relations,
      // TODO:
      cache,
      transaction,
    });
  };

  /**
   * Profile by LoginIdentificator
   *
   * @async
   * @param {string} id LoginIdentificator (LDAP: ObjectGUID)
   * @param {boolean} cache =true, From cache
   * @return {Promise<Profile | undefined>} Profile
   */
  byLoginGUID = async ({
    loginGUID,
    domain,
    isRelations = true,
    cache = true,
    transaction = false,
    loggerContext,
  }: {
    loginGUID: string;
    domain?: string | null;
    isRelations?: boolean | 'manager';
    cache?: boolean;
    transaction?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<Profile | undefined> => {
    const where: FindConditions<Profile> = { loginService: LoginService.LDAP, loginGUID };
    if (domain) {
      where.loginDomain = domain;
    }
    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['manager'] : [];

    const profile = await this.profileRepository
      .findOne({
        where,
        relations,
        // TODO:
        cache,
        transaction,
      })
      .catch((error) => {
        this.logger.error({
          message: `Profile error: ${error.toString()}`,
          error,
          context: ProfileService.name,
          function: 'byLoginIdentificator',
          ...loggerContext,
        });

        return undefined;
      });

    return profile;
  };

  /**
   * Search suggestions
   *
   * @async
   * @param {string} search Search string
   * @return {Promise<string[]>} The search suggestions
   * @throws {Error} Exception
   */
  searchSuggestions = async ({
    search,
    loggerContext,
  }: {
    search: string;
    loggerContext?: LoggerContext;
  }): Promise<SearchSuggestions[]> => {
    const query = this.profileRepository
      .createQueryBuilder('profile')
      .where('profile.notShowing = :notShowing')
      .andWhere('profile.disabled = :disabled');

    search.split('+').forEach((value) => {
      const cleared = value !== '' ? `'%${value}%'` : '';

      if (cleared) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where(`profile.lastName iLike ${cleared}`)
              .orWhere(`profile.firstName iLike ${cleared}`)
              .orWhere(`profile.middleName iLike ${cleared}`)
              .orWhere(`profile.lastName || ' ' || profile.firstName || ' ' || profile.middleName iLike ${cleared}`)
              .orWhere(`profile.username iLike ${cleared}`)
              .orWhere(`profile.company iLike ${cleared}`)
              .orWhere(`profile.management iLike ${cleared}`)
              .orWhere(`profile.department iLike ${cleared}`)
              .orWhere(`profile.division iLike ${cleared}`)
              .orWhere(`profile.title iLike ${cleared}`)
              .orWhere(`profile.city iLike ${cleared}`)
              .orWhere(`profile.telephone iLike ${cleared}`)
              .orWhere(`profile.workPhone iLike ${cleared}`)
              .orWhere(`profile.mobile iLike ${cleared}`);
          }),
        );
      }
    });

    const intResult = await query
      .orderBy('profile.lastName', 'ASC')
      .select([
        'profile.lastName',
        'profile.firstName',
        'profile.middleName',
        'profile.username',
        'profile.department',
        'profile.title',
        'profile.city',
        'profile.company',
        'profile.management',
        'profile.department',
        'profile.division',
        'profile.telephone',
        'profile.workPhone',
        'profile.mobile',
        'profile.thumbnailPhoto40',
      ])
      .distinctOn([
        'profile.lastName',
        'profile.firstName',
        'profile.middleName',
        'profile.username',
        'profile.department',
        'profile.title',
        'profile.city',
        'profile.company',
        'profile.management',
        'profile.department',
        'profile.division',
        'profile.telephone',
        'profile.workPhone',
        'profile.mobile',
      ])
      .setParameters({
        notShowing: false,
        disabled: false,
      })
      .cache(true)
      .getMany();

    const result = intResult.reduce((accumulator: SearchSuggestions[], current: Profile) => {
      const lower = search
        .toLowerCase()
        .split('+')
        .map((l) => l.trim());
      let showing = '';
      let avatar = '';

      // const contact = current.username ? Contact.USER : Contact.PROFILE;
      const fullName = `${current.lastName || ''} ${current.firstName || ''} ${current.middleName || ''}`.toLowerCase();

      if (lower.some((l) => fullName.includes(l))) {
        showing = current.fullName || '';
        avatar = current.thumbnailPhoto40 as string;
      } else if (lower.some((l) => current.management && current.management.toLowerCase().includes(l))) {
        showing = current.management || '';
      } else if (lower.some((l) => current.department && current.department.toLowerCase().includes(l))) {
        showing = current.department || '';
      } else if (lower.some((l) => current.division && current.division.toLowerCase().includes(l))) {
        showing = current.division || '';
      } else if (lower.some((l) => current.company && current.company.toLowerCase().includes(l))) {
        showing = current.company || '';
      } else if (lower.some((l) => current.title && current.title.toLowerCase().includes(l))) {
        showing = current.title || '';
      } else if (lower.some((l) => current.city && current.city.toLowerCase().includes(l))) {
        showing = current.city || '';
      }

      if (showing === '' || accumulator.find((item) => item.name === showing)) {
        return accumulator;
      }

      return [...accumulator, { name: showing, avatar }];
    }, [] as SearchSuggestions[]);

    return result.length <= 1 ? [] : result.length > 10 ? [...result.slice(0, 10), { name: '...' }] : result;
  };

  /**
   * Create or update by user DN
   *
   * @async
   * @param {string} userByDN User by DN
   * @param {number} [count = 1] Count for manager
   * @returns {Promise<Profile | undefined>} Profile entity
   */
  async fromLdapDN({
    dn,
    domain,
    count = 1,
    transaction = true,
    loggerContext,
  }: {
    dn: string;
    domain: string;
    count?: number;
    transaction?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<Profile | undefined> {
    if (count <= 10) {
      const ldapUser = await this.ldapService.searchByDN({ dn, domain, loggerContext });

      if (ldapUser) {
        return this.fromLdap({ ldapUser, transaction, domain, count: count + 1, loggerContext });
      }
    } else {
      this.logger.log({
        message: `The LDAP count > 10, manager is not inserted: ${dn}`,
        context: ProfileService.name,
        function: 'fromLdapDN',
        ...loggerContext,
      });
    }

    return undefined;
  }

  /**
   * Create or Update user profiles
   *
   * @async
   * @param {LdapResponseUser} ldapUser The LDAP user
   * @param {Profile} profile Profile from Database
   * @param {boolean} [save = true] Save the profile
   * @param {number} [count = 1] Count for manager
   * @returns {Promise<Profile>} The profile entity
   * @throws {Error} Exception
   */
  async fromLdap({
    ldapUser,
    domain,
    profile,
    save = true,
    transaction = true,
    count = 1,
    loggerContext,
  }: {
    ldapUser: LdapResponseUser;
    domain: string;
    profile?: Profile;
    save?: boolean;
    transaction?: boolean;
    count?: number;
    loggerContext?: LoggerContext;
  }): Promise<Profile> {
    const manager =
      ldapUser.manager && ldapUser.dn !== ldapUser.manager
        ? await this.fromLdapDN({ dn: ldapUser.manager, domain, count, transaction, loggerContext }).catch((error) => {
            this.logger.log({
              message: `Manager is not inserted: "${ldapUser.manager}"`,
              error,
              context: ProfileService.name,
              function: 'fromLdap',
              ...loggerContext,
            });

            return undefined;
          })
        : undefined;

    let comment: Record<string, string>;
    try {
      comment = JSON.parse(ldapUser.comment);
    } catch {
      comment = {};
    }
    const { companyEng, nameEng, managementEng, departmentEng, divisionEng, titleEng, gender, birthday: birthdayRaw } = comment;

    const thumbnailPhotoBuffer = ldapUser.thumbnailPhoto ? Buffer.from(ldapUser.thumbnailPhoto, 'base64') : undefined;

    const thumbnailPhoto = thumbnailPhotoBuffer
      ? this.imageService.imageResize(thumbnailPhotoBuffer, 250, 250).then((img) => (img ? img.toString('base64') : undefined))
      : undefined;
    const thumbnailPhoto40 = thumbnailPhotoBuffer
      ? this.imageService.imageResize(thumbnailPhotoBuffer).then((img) => (img ? img.toString('base64') : undefined))
      : undefined;

    const displayName = 'displayName' in ldapUser && ldapUser.displayName.split(' ');
    const middleName = Array.isArray(displayName) && displayName.length === 3 ? displayName[2] : '';
    const birthdaySplitted = typeof birthdayRaw === 'string' && birthdayRaw !== null ? birthdayRaw.split('T').shift() : undefined;
    const birthday = birthdaySplitted ? new Date(birthdaySplitted) : null;

    if (!profile) {
      // eslint-disable-next-line no-param-reassign
      profile = await this.byLoginGUID({ domain, loginGUID: ldapUser.objectGUID, loggerContext });
    }

    const lastName = typeof ldapUser.sn === 'string' && ldapUser.sn !== null ? ldapUser.sn.trim() : undefined;
    const firstName = typeof ldapUser.givenName === 'string' && ldapUser.givenName !== null ? ldapUser.givenName.trim() : undefined;

    const dataProfile = {
      ...profile,
      username: ldapUser.sAMAccountName,
      loginService: LoginService.LDAP,
      loginDomain: ldapUser.loginDomain || domain,
      loginGUID: ldapUser.objectGUID,
      loginDN: ldapUser.dn,
      firstName,
      lastName,
      middleName,
      birthday,
      gender: gender === 'M' ? Gender.MAN : gender === 'W' ? Gender.WOMAN : Gender.UNKNOWN,
      country: ldapUser.co?.trim() ?? '',
      postalCode: ldapUser.postalCode?.trim(),
      city: ldapUser.l?.trim(),
      region: ldapUser.st?.trim(),
      street: ldapUser.streetAddress?.trim(),
      company: ldapUser.company?.trim(),
      management: ldapUser.department?.trim(),
      department: ldapUser['msDS-cloudExtensionAttribute6']?.trim(),
      division: ldapUser['msDS-cloudExtensionAttribute7']?.trim(),
      title: ldapUser.title?.trim(),
      manager,
      email: ldapUser.mail?.trim(),
      telephone: ldapUser.telephoneNumber?.trim(),
      workPhone:
        Array.isArray(ldapUser.otherTelephone) && ldapUser.otherTelephone.length > 0
          ? ldapUser.otherTelephone.join(', ')
          : ldapUser.otherTelephone
          ? ldapUser.otherTelephone.toString()
          : undefined,
      mobile: ldapUser.mobile?.trim(),
      fax: ldapUser.facsimileTelephoneNumber?.trim(),
      room: ldapUser.physicalDeliveryOfficeName?.trim(),
      employeeID: ldapUser.employeeID,
      companyEng: typeof companyEng === 'string' && companyEng !== null ? companyEng.trim() : undefined,
      nameEng: typeof nameEng === 'string' && nameEng !== null ? nameEng.trim() : undefined,
      managementEng: typeof managementEng === 'string' && managementEng !== null ? managementEng.trim() : undefined,
      departmentEng: typeof departmentEng === 'string' && departmentEng !== null ? departmentEng.trim() : undefined,
      divisionEng: typeof divisionEng === 'string' && divisionEng !== null ? divisionEng.trim() : undefined,
      titleEng: typeof titleEng === 'string' && titleEng !== null ? titleEng.trim() : undefined,
      // Access Card is msDS-cloudExtensionAttribute13
      accessCard: ldapUser['msDS-cloudExtensionAttribute13'],
      // eslint-disable-next-line no-bitwise
      disabled: !!(Number.parseInt(ldapUser.userAccountControl, 10) & 2),
      notShowing: Number.parseInt(ldapUser.flags, 10) === 1,
      thumbnailPhoto: (thumbnailPhoto as unknown) as string,
      thumbnailPhoto40: (thumbnailPhoto40 as unknown) as string,
      createdAt: ldapUser.whenCreated,
      updatedAt: ldapUser.whenChanged,
    };

    const data = this.profileRepository.create(dataProfile);

    return save ? this.save({ profile: data, loggerContext, transaction }) : data;
  }

  /**
   * Create profile
   *
   * @param {Profile} profile DeepPartial<Profile>
   * @returns {Promise<Profile>} Profile entity
   */
  create = ({ profile, loggerContext }: { profile: unknown; loggerContext?: LoggerContext }): Profile => {
    if (typeof profile === 'object' && profile !== null) {
      return this.profileRepository.create(profile);
    }

    throw new InternalServerErrorException(__DEV__ ? PortalError.NOT_IMPLEMENTED : undefined);
  };

  /**
   * Bulk Save
   *
   * @async
   * @param {Profile[]} profiles The profile before save
   * @returns {Promise<Profile[]>} The profile after save
   * @throws {Error} Exception
   */
  bulkSave = async ({
    profiles,
    loggerContext,
    transaction = true,
  }: {
    profiles: Profile[];
    loggerContext?: LoggerContext;
    transaction?: boolean;
  }): Promise<Profile[]> =>
    this.profileRepository
      .save<Profile>(profiles, { transaction })
      .catch((error: Error) => {
        this.logger.error({
          message: `Unable to save data in "profile": ${error.toString()}`,
          error,
          context: ProfileService.name,
          function: 'bulkSave',
          ...loggerContext,
        });

        throw error;
      });

  /**
   * Save
   *
   * @async
   * @param {Profile} profile The profile before save
   * @returns {Promise<Profile>} The profile after save
   * @throws {Error} Exception
   */
  save = async ({
    profile,
    loggerContext,
    transaction = true,
  }: {
    profile: Profile;
    loggerContext?: LoggerContext;
    transaction?: boolean;
  }): Promise<Profile> =>
    this.profileRepository
      .save<Profile>(profile, { transaction })
      .then((p) => {
        if (p && !p.fullName) {
          const f: Array<string> = [];
          if (p.lastName) {
            f.push(p.lastName);
          }
          if (p.firstName) {
            f.push(p.firstName);
          }
          if (p.middleName) {
            f.push(p.middleName);
          }
          p.fullName = f.join(' ');
        }
        return p;
      })
      .catch((error: Error) => {
        this.logger.error({
          message: `Unable to save data in "profile": ${error.toString()}`,
          error,
          context: ProfileService.name,
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
    criteria: string | string[] | number | number[] | Date | Date[] | FindConditions<Profile>;
    partialEntity: QueryDeepPartialEntity<Profile>;
    loggerContext?: LoggerContext;
  }): Promise<UpdateResult> => this.profileRepository.update(criteria, partialEntity);

  /**
   * Profile field selection
   *
   * @async
   * @param {string} field PhonebookFieldSelection
   * @returns {Promise<string[]>} Field selection
   * @throws {Error} Exception
   */
  fieldSelection = async ({
    field,
    // department,
    loggerContext,
  }: {
    field: PhonebookColumnNames;
    // department?: string;
    loggerContext?: LoggerContext;
  }): Promise<string[]> => {
    const query = this.profileRepository.createQueryBuilder('profile');
    const ifManager = field === PhonebookColumnNames.manager;

    if (ifManager) {
      query
        .where(
          new Brackets((qb) => {
            qb.where('profile.management = :management').orWhere('profile.management IS NULL');
            // qb.where('profile.department = :department').orWhere('profile.department IS NULL');
            qb.where('profile.division = :division').orWhere('profile.division IS NULL');
          }),
        )
        .orderBy('profile.lastName', 'ASC');
    } else {
      query
        .select(`profile.${field}`)
        .orderBy(`profile.${field}`, 'ASC')
        .distinctOn([`profile.${field}`]);
    }

    const result = await query
      .andWhere('profile.notShowing = :notShowing')
      .andWhere('profile.disabled = :disabled')
      .setParameters({
        // department,
        notShowing: false,
        disabled: false,
      })
      .cache(true)
      .getMany();

    return result.reduce((accumulator: string[], current: Profile) => {
      const data = ifManager
        ? `${current.lastName || ''} ${current.firstName || ''} ${current.middleName || ''}`
        : current[field as keyof Profile];

      if (typeof data === 'string' && data) {
        return [...accumulator, data];
      }

      return accumulator;
    }, []);
  };

  /**
   * Modification
   */
  modification = ({
    profile,
    created,
    ldapUser,
    loggerContext,
  }: {
    profile: ProfileInput;
    created?: Profile;
    ldapUser?: LdapResponseUser;
    loggerContext?: LoggerContext;
  }): LDAPAddEntry => {
    const modification: LDAPAddEntry = {};

    if (profile) {
      Object.keys(profile).forEach((key) => {
        const valueCleaned = key === 'workPhone' ? profile.workPhone || '' : (this.clean(profile[key as keyof ProfileInput]) as string);

        switch (key) {
          case 'username':
            modification.sAMAccountName = valueCleaned;
            break;
          case 'firstName': {
            modification.givenName = valueCleaned;

            const f: Array<string> = [];
            if (profile?.lastName) {
              f.push(profile.lastName);
            } else if (created?.lastName) {
              f.push(created.lastName);
            }
            f.push(valueCleaned);
            if (profile?.middleName) {
              f.push(profile.middleName);
            } else if (created?.middleName) {
              f.push(created.middleName);
            }
            modification.displayName = f.join(' ');

            break;
          }
          case 'lastName': {
            modification.sn = valueCleaned;

            const f: Array<string> = [];
            f.push(valueCleaned);
            if (profile?.firstName) {
              f.push(profile.firstName);
            } else if (created?.firstName) {
              f.push(created.firstName);
            }
            if (profile?.middleName) {
              f.push(profile.middleName);
            } else if (created?.middleName) {
              f.push(created.middleName);
            }
            modification.displayName = f.join(' ');

            break;
          }
          case 'middleName': {
            modification[key] = valueCleaned;

            const f: Array<string> = [];
            if (profile?.lastName) {
              f.push(profile.lastName);
            } else if (created?.lastName) {
              f.push(created.lastName);
            }
            if (profile?.firstName) {
              f.push(profile.firstName);
            } else if (created?.firstName) {
              f.push(created.firstName);
            }
            f.push(valueCleaned);
            modification.displayName = f.join(' ');

            break;
          }
          case 'gender':
            modification.comment = {
              ...(modification.comment as Record<string, string>),
              [key]: ((valueCleaned as unknown) as Gender) === Gender.MAN ? 'M' : 'W',
            };
            break;
          case 'birthday':
            modification.comment = { ...(modification.comment as Record<string, string>), birthday: valueCleaned };
            break;
          case 'companyEng':
          case 'nameEng':
          case 'managementEng':
          case 'departmentEng':
          case 'divisionEng':
          case 'titleEng':
            modification.comment = { ...(modification.comment as Record<string, string>), [key]: valueCleaned };
            break;
          case 'country':
            modification.co = valueCleaned;
            break;
          case 'city':
            modification.l = valueCleaned;
            break;
          case 'region':
            modification.st = valueCleaned;
            break;
          case 'street':
            modification.streetAddress = valueCleaned;
            break;
          case 'email':
            modification.mail = valueCleaned;
            break;
          case 'telephone':
            modification.telephoneNumber = valueCleaned;
            break;
          case 'workPhone':
            modification.otherTelephone = valueCleaned.includes(',') ? valueCleaned.split(',') : valueCleaned;
            break;
          case 'fax':
            modification.facsimileTelephoneNumber = valueCleaned;
            break;
          case 'room':
            modification.physicalDeliveryOfficeName = valueCleaned;
            break;
          case 'notShowing':
            modification.flags = valueCleaned ? '1' : '0';
            break;
          case 'management':
            modification.department = valueCleaned;
            break;
          case 'department':
            modification['msDS-cloudExtensionAttribute6'] = valueCleaned;
            break;
          case 'division':
            modification['msDS-cloudExtensionAttribute7'] = valueCleaned;
            break;
          // имена ключей совпадают
          case 'employeeID':
          case 'postalCode':
          case 'company':
          case 'title':
          case 'mobile':
            modification[key] = valueCleaned;
            break;
          default:
            break;
        }
      });
    }

    if (modification.displayName && !ldapUser) {
      modification.cn = modification.displayName;
    }

    if (modification.comment && Object.keys(modification.comment).length === 0) {
      delete modification.comment;
    } else {
      let oldComment = {};

      if (ldapUser) {
        try {
          oldComment = JSON.parse(ldapUser.comment);
          // eslint-disable-next-line no-empty
        } catch {}
      }

      modification.comment = JSON.stringify({ ...oldComment, ...(modification.comment as Record<string, string>) });
    }

    return modification;
  };

  /**
   * changeProfile
   *
   * @async
   * @param {Request} req Express Request
   * @param {Profile} profile Profile params
   * @param {Promise<FileUpload>} thumbnailPhoto Avatar
   * @returns {Promise<Profile>} The corrected Profile
   * @throws {Error|BadRequestException|NotAcceptableException}
   * @throws {ForbiddenException|PayloadTooLargeException|UnprocessableEntityException}
   */
  async changeProfile({
    user,
    profile,
    thumbnailPhoto,
    loggerContext,
  }: {
    user: User;
    profile: ProfileInput;
    thumbnailPhoto?: Promise<FileUpload>;
    loggerContext?: LoggerContext;
  }): Promise<PROFILE_TYPE> {
    let thumbnailPhotoProcessed: Buffer | undefined;

    const updated = { ...profile, id: user.profile.id };

    const created = await this.profileRepository.findOne(updated.id);
    if (!created) {
      throw new Error('Profile repository: "created" is null');
    }

    if (thumbnailPhoto) {
      await constructUploads([thumbnailPhoto], ({ file }) => {
        thumbnailPhotoProcessed = file;
      });
    }

    if (created.loginDN && created.loginService === LoginService.LDAP) {
      const domain = created.loginDomain as string;
      let ldapUser: LdapResponseUser | undefined;
      try {
        ldapUser = await this.ldapService.searchByDN({ dn: created.loginDN, domain, loggerContext });
      } catch (error) {
        if (!(error instanceof NoSuchObjectError)) {
          throw error;
        }
      }
      if (!ldapUser) {
        try {
          ldapUser = await this.ldapService.searchByDN({ dn: created.loginDN, domain, cache: false, loggerContext });
        } catch (error) {
          if (!(error instanceof NoSuchObjectError)) {
            throw error;
          }
        }
      }
      if (!ldapUser) {
        if (created.username) {
          ldapUser = await this.ldapService.searchByUsername({
            username: created.username,
            domain,
            cache: false,
            loggerContext,
          });
        }
      }

      if (ldapUser) {
        const modification = this.modification({ profile, created, ldapUser, loggerContext });

        const ldapUpdated = Object.keys(modification).map(
          (key) =>
            new Change({
              operation: 'replace',
              modification: new Attribute({ type: key, vals: modification[key] }),
            }),
        );
        if (thumbnailPhotoProcessed) {
          ldapUpdated.push(
            new Change({
              operation: 'replace',
              modification: new Attribute({ type: 'thumbnailPhoto', vals: thumbnailPhotoProcessed }),
            }),
          );
        }

        if (ldapUpdated.length === 0) {
          throw new UnprocessableEntityException();
        }
        await this.ldapService
          .modify({
            dn: ldapUser.dn,
            data: ldapUpdated,
            domain,
            username: created && created.username ? created.username : undefined,
            // TODO: .modify with password parameter
            // password: (req.session!.passport!.user as UserResponse)!.passwordFrontend,
            loggerContext,
          })
          .catch((error: Error | LdapError) => {
            if (error instanceof InsufficientAccessRightsError) {
              throw new ForbiddenException(__DEV__ ? error : undefined);
            } else if (error.name === 'ConstraintViolationError') {
              throw new PayloadTooLargeException(__DEV__ ? error : undefined);
            }
            throw new BadRequestException(__DEV__ ? error : undefined);
          });
      } else {
        profile.disabled = true;
        profile.notShowing = true;
      }
    }

    const thumbnail = thumbnailPhotoProcessed
      ? {
          thumbnailPhoto: thumbnailPhotoProcessed.toString('base64'),
          thumbnailPhoto40: await this.imageService
            .imageResize(thumbnailPhotoProcessed)
            .then((value: Buffer | undefined) => value?.toString('base64')),
        }
      : {};
    const result = this.profileRepository.merge(created, profile, thumbnail as Profile);

    return this.save({ profile: result, loggerContext });

    // .then(async (profileUpdated) => {
    //     // TODO: what I do ?...
    //   if (user.profile.id === profileUpdated.id) {
    //     user.profile = profileUpdated;
    //   }

    //   // TODO:  разобраться
    //   // await this.profileRepository.manager.connection?.queryResultCache?.remove([
    //   //   'profile',
    //   //   'profile_searchSuggestions',
    //   //   'profile_fieldSelection',
    //   // ]);

    //   return profileUpdated;
    // });
  }
}
