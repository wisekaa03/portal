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
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder, FindConditions, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import type { FileUpload } from 'graphql-upload';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LdapService, Change, Attribute, NoSuchObjectError, InsufficientAccessRightsError } from 'nestjs-ldap';
import type { LoggerContext, LdapResponseUser, LDAPAddEntry, LdapError } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import type { User, Profile, SearchSuggestions, AllUsersInfo, ProfileInput } from '@lib/types';
import { LoginService, Contact, Gender } from '@lib/types';
import { PROFILE_AUTOCOMPLETE_FIELDS } from '@lib/constants';
import { ConfigService } from '@app/config';
import { ImageService } from '@app/image';
import { constructUploads } from '@back/shared/upload';
import { ProfileEntity } from './profile.entity';
import { PortalError } from '../shared/errors';
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
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
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
        select: ['id', 'loginDomain', 'loginIdentificator', 'username'],
        loadEagerRelations: false,
        cache,
      })
      .then((profile) =>
        profile.map((p) => ({
          contact: Contact.PROFILE,
          id: p.id,
          domain: p.loginDomain,
          loginIdentificator: p.loginIdentificator,
          name: p.username,
          disable: p.disabled,
        })),
      );

  /**
   * Get profiles
   *
   * @param {string} string The search string
   * @param {boolean} disabled The disabled flag
   * @param {boolean} notShowing The not showing flag
   * @return {SelectQueryBuilder<ProfileEntity>}
   */
  getProfiles = ({
    search,
    disabled,
    notShowing,
    loggerContext,
  }: {
    search: string;
    disabled: boolean;
    notShowing: boolean;
    loggerContext?: LoggerContext;
  }): SelectQueryBuilder<ProfileEntity> => {
    const query = this.profileRepository.createQueryBuilder('profile').leftJoinAndSelect('profile.manager', 'manager');

    const parameters = { notShowing, disabled };

    if (!disabled) {
      query.andWhere('profile.disabled = :disabled');
    }

    if (!notShowing) {
      query.andWhere('profile.notShowing = :notShowing');
    }

    search.split('+').forEach((value) => {
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
              .orWhere(`profile.town iLike ${cleared}`)
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
   * @return {Promise<ProfileEntity | undefined>} Profile
   */
  byId = async ({
    id,
    isRelations = true,
    cache = true,
    loggerContext,
  }: {
    id: string;
    isRelations?: boolean | 'manager';
    cache?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<ProfileEntity | undefined> => {
    const where: FindConditions<ProfileEntity> = { id };
    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['manager'] : [];

    return this.profileRepository.findOne({
      where,
      relations,
      // TODO:
      cache,
    });
  };

  /**
   * Profile by username
   *
   * @async
   * @param {string} username Username
   * @param {boolean} cache From cache
   * @return {Promise<ProfileEntity | undefined>} Profile
   */
  byUsername = async ({
    username,
    isRelations = true,
    cache = true,
    loggerContext,
  }: {
    username: string;
    isRelations: boolean | 'manager';
    cache: boolean;
    loggerContext?: LoggerContext;
  }): Promise<ProfileEntity | undefined> => {
    const where: FindConditions<ProfileEntity> = { username };
    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['manager'] : [];

    return this.profileRepository.findOne({
      where,
      relations,
      // TODO:
      cache,
    });
  };

  /**
   * Profile by LoginIdentificator
   *
   * @async
   * @param {string} id LoginIdentificator (LDAP: ObjectGUID)
   * @param {boolean} cache =true, From cache
   * @return {Promise<ProfileEntity | undefined>} Profile
   */
  byLoginIdentificator = async ({
    loginIdentificator,
    isRelations = true,
    cache = true,
    loggerContext,
  }: {
    loginIdentificator: string;
    isRelations?: boolean | 'manager';
    cache?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<ProfileEntity | undefined> => {
    const where: FindConditions<ProfileEntity> = { loginIdentificator };
    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['manager'] : [];

    const profile = await this.profileRepository
      .findOne({
        where,
        relations,
        // TODO:
        cache,
      })
      .catch((error) => {
        this.logger.error(`Profile error: ${error.toString()}`, {
          error,
          context: ProfileService.name,
          function: this.byLoginIdentificator.name,
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
              .orWhere(`profile.town iLike ${cleared}`)
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
        'profile.town',
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
        'profile.town',
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

    const result = intResult.reduce((accumulator: SearchSuggestions[], current: ProfileEntity) => {
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
      } else if (lower.some((l) => current.town && current.town.toLowerCase().includes(l))) {
        showing = current.town || '';
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
   * @returns {Promise<ProfileEntity | undefined>} Profile entity
   */
  async fromLdapDN({
    userByDN,
    domain,
    count = 1,
    loggerContext,
  }: {
    userByDN: string;
    domain: string;
    count?: number;
    loggerContext?: LoggerContext;
  }): Promise<ProfileEntity | undefined> {
    if (count <= 10) {
      const ldapUser = await this.ldapService.searchByDN({ userByDN, domain, loggerContext });

      if (ldapUser) {
        return this.fromLdap({ ldapUser, domain, save: true, count: count + 1, loggerContext });
      }
    } else {
      this.logger.info(`The LDAP count > 10, manager is not inserted: ${userByDN}`, {
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
   * @param {ProfileEntity} profile Profile from Database
   * @param {boolean} [save = true] Save the profile
   * @param {number} [count = 1] Count for manager
   * @returns {Promise<ProfileEntity>} The profile entity
   * @throws {Error} Exception
   */
  async fromLdap({
    ldapUser,
    domain,
    profile,
    save = true,
    count = 1,
    loggerContext,
  }: {
    ldapUser: LdapResponseUser;
    domain: string;
    profile?: ProfileEntity;
    save?: boolean;
    count?: number;
    loggerContext?: LoggerContext;
  }): Promise<ProfileEntity> {
    const manager =
      ldapUser.manager && ldapUser.dn !== ldapUser.manager
        ? await this.fromLdapDN({ userByDN: ldapUser.manager, domain, count, loggerContext })
        : undefined;

    let comment: Record<string, string>;
    try {
      comment = JSON.parse(ldapUser.comment);
    } catch {
      comment = {};
    }
    const { companyEng, nameEng, managementEng, departmentEng, divisionEng, positionEng, gender, birthday } = comment;

    const thumbnailPhotoBuffer = ldapUser.thumbnailPhoto ? Buffer.from(ldapUser.thumbnailPhoto, 'base64') : undefined;

    const thumbnailPhoto = thumbnailPhotoBuffer
      ? this.imageService.imageResize(thumbnailPhotoBuffer, 250, 250).then((img) => (img ? img.toString('base64') : undefined))
      : undefined;
    const thumbnailPhoto40 = thumbnailPhotoBuffer
      ? this.imageService.imageResize(thumbnailPhotoBuffer).then((img) => (img ? img.toString('base64') : undefined))
      : undefined;

    const displayName = 'displayName' in ldapUser && ldapUser.displayName.split(' ');
    const middleName = displayName && displayName.length === 3 ? displayName[2] : '';

    if (!profile) {
      // eslint-disable-next-line no-param-reassign
      profile = await this.byLoginIdentificator({ loginIdentificator: ldapUser.objectGUID, loggerContext });
    }

    const dataProfile = {
      ...profile,
      dn: ldapUser.dn,
      username: ldapUser.sAMAccountName,
      loginService: LoginService.LDAP,
      loginDomain: ldapUser.loginDomain || domain,
      loginIdentificator: ldapUser.objectGUID,
      firstName: ldapUser.givenName,
      lastName: ldapUser.sn,
      middleName,
      birthday: !birthday ? null : birthday,
      gender: gender === 'M' ? Gender.MAN : gender === 'W' ? Gender.WOMAN : Gender.UNKNOWN,
      country: ldapUser.co,
      postalCode: ldapUser.postalCode,
      town: ldapUser.l,
      region: ldapUser.st,
      street: ldapUser.streetAddress,
      company: ldapUser.company,
      management: ldapUser.department,
      department: ldapUser['msDS-cloudExtensionAttribute6'],
      division: ldapUser['msDS-cloudExtensionAttribute7'],
      title: ldapUser.title,
      manager: typeof manager !== 'undefined' ? manager : null,
      email: ldapUser.mail,
      telephone: ldapUser.telephoneNumber,
      workPhone: ldapUser.otherTelephone,
      mobile: ldapUser.mobile,
      fax: ldapUser.facsimileTelephoneNumber,
      room: ldapUser.physicalDeliveryOfficeName,
      employeeID: ldapUser.employeeID,
      companyEng,
      nameEng,
      managementEng,
      departmentEng,
      divisionEng,
      positionEng,
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

    return save ? this.save({ profile: data, loggerContext }) : data;
  }

  /**
   * Create profile
   *
   * @param {Profile} profile DeepPartial<ProfileEntity>
   * @returns {Promise<ProfileEntity>} Profile entity
   */
  create = ({ profile, loggerContext }: { profile: unknown; loggerContext?: LoggerContext }): ProfileEntity => {
    if (typeof profile === 'object' && profile !== null) {
      return this.profileRepository.create(profile);
    }

    throw new InternalServerErrorException(__DEV__ ? PortalError.NOT_IMPLEMENTED : undefined);
  };

  /**
   * Bulk Save
   *
   * @async
   * @param {ProfileEntity[]} profiles The profile before save
   * @returns {Promise<ProfileEntity[]>} The profile after save
   * @throws {Error} Exception
   */
  bulkSave = async ({ profiles, loggerContext }: { profiles: ProfileEntity[]; loggerContext?: LoggerContext }): Promise<ProfileEntity[]> =>
    this.profileRepository.save<ProfileEntity>(profiles).catch((error: Error) => {
      this.logger.error(`Unable to save data in "profile": ${error.toString()}`, {
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
   * @param {ProfileEntity} profile The profile before save
   * @returns {Promise<ProfileEntity>} The profile after save
   * @throws {Error} Exception
   */
  save = async ({ profile, loggerContext }: { profile: ProfileEntity; loggerContext?: LoggerContext }): Promise<ProfileEntity> =>
    this.profileRepository
      .save<ProfileEntity>(profile)
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
        this.logger.error(`Unable to save data in "profile": ${error.toString()}`, {
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
    criteria: string | string[] | number | number[] | Date | Date[] | FindConditions<ProfileEntity>;
    partialEntity: QueryDeepPartialEntity<ProfileEntity>;
    loggerContext?: LoggerContext;
  }): Promise<UpdateResult> => this.profileRepository.update(criteria, partialEntity);

  /**
   * Profile field selection
   *
   * @async
   * @param {string} field Field: 'company' | 'management' | 'department' | 'division' | 'country' |
   *                              'region' | 'town' | 'street' | 'postalCode'
   * @returns {Promise<string[]>} Field selection
   * @throws {Error} Exception
   */
  fieldSelection = async ({
    field,
    department,
    loggerContext,
  }: {
    field: typeof PROFILE_AUTOCOMPLETE_FIELDS[number];
    department?: string;
    loggerContext?: LoggerContext;
  }): Promise<string[]> => {
    const query = this.profileRepository.createQueryBuilder('profile');
    const ifManager = field === 'manager' && department;

    if (ifManager) {
      query
        .where(
          new Brackets((qb) => {
            qb.where('profile.management = :management').orWhere('profile.management IS NULL');
            qb.where('profile.department = :department').orWhere('profile.department IS NULL');
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
        department,
        notShowing: false,
        disabled: false,
      })
      .cache(true)
      .getMany();

    return result.reduce((accumulator: string[], current: ProfileEntity) => {
      const data = ifManager
        ? `${current.lastName || ''} ${current.firstName || ''} ${current.middleName || ''}`
        : current[field as keyof ProfileEntity];

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
        const valueCleaned = this.clean(profile[key as keyof ProfileInput]) as string;

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
            if ([Gender.MAN, Gender.WOMAN].includes(Number.parseInt(valueCleaned, 10))) {
              modification.comment = {
                ...(modification.comment as Record<string, string>),
                [key]: ((valueCleaned as unknown) as Gender) === Gender.MAN ? 'M' : 'W',
              };
            }
            break;
          case 'birthday':
            modification.comment = { ...(modification.comment as Record<string, string>), birthday: valueCleaned };
            break;
          case 'companyEng':
          case 'nameEng':
          case 'managementEng':
          case 'departmentEng':
          case 'divisionEng':
          case 'positionEng':
            modification.comment = { ...(modification.comment as Record<string, string>), [key]: valueCleaned };
            break;
          case 'country':
            modification.co = valueCleaned;
            break;
          case 'town':
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
            modification.otherTelephone = valueCleaned;
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
   * @returns {Promise<ProfileEntity>} The corrected ProfileEntity
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
  }): Promise<ProfileEntity> {
    let thumbnailPhotoProcessed: Buffer | undefined;

    const updated = { id: user.profile.id, ...profile };

    const created = await this.profileRepository.findOne(updated.id);
    if (!created) {
      throw new Error('Profile repository: "created" is null');
    }

    if (thumbnailPhoto) {
      await constructUploads([thumbnailPhoto], ({ file }) => {
        thumbnailPhotoProcessed = file;
      });
    }

    if (created.dn && created.loginService === LoginService.LDAP) {
      const domain = user.loginDomain as string;
      let ldapUser: LdapResponseUser | undefined;
      try {
        ldapUser = await this.ldapService.searchByDN({ userByDN: created.dn, domain, loggerContext });
      } catch (error) {
        if (!(error instanceof NoSuchObjectError)) {
          throw error;
        }
      }
      if (!ldapUser) {
        try {
          ldapUser = await this.ldapService.searchByDN({ userByDN: created.dn, domain, cache: false, loggerContext });
        } catch (error) {
          if (!(error instanceof NoSuchObjectError)) {
            throw error;
          }
        }
      }
      if (!ldapUser) {
        if (created.username) {
          ldapUser = await this.ldapService.searchByUsername({
            userByUsername: created.username,
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
    const result = this.profileRepository.merge(created, profile || undefined, thumbnail as ProfileEntity);

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
