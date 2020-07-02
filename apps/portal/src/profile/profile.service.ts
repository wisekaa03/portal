/** @format */

//#region Imports NPM
import {
  Injectable,
  NotAcceptableException,
  PayloadTooLargeException,
  BadRequestException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder, FindConditions, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import Ldap from 'ldapjs';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { Profile, Gender, LoginService, Contact, AllUsersInfo } from '@lib/types';
import { PROFILE_AUTOCOMPLETE_FIELDS } from '@lib/constants';
import { ConfigService } from '@app/config';
import { ImageService } from '@app/image';
import { LdapService, LdapResponseUser, Change, Attribute } from '@app/ldap';
import { constructUploads } from '@back/shared/upload';
import { ProfileEntity } from './profile.entity';
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

  clean = (value: string | number | boolean): string | number | boolean => {
    // TODO: продумать варианты очистки и безопасности
    return typeof value === 'string' ? value.trim() : value;
  };

  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly configService: ConfigService,
    @InjectPinoLogger(ProfileService.name) private readonly logger: PinoLogger,
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
  allProfiles = async (loginService = LoginService.LDAP, disabled = false): Promise<AllUsersInfo[]> => {
    return (
      this.profileRepository
        // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
        .find({
          where: { loginService, disabled },
          select: ['id', 'loginIdentificator', 'username'],
          loadEagerRelations: false,
          cache: false,
        })
        .then((profile) =>
          profile.map((profile) => ({
            contact: Contact.PROFILE,
            id: profile.id,
            loginIdentificator: profile.loginIdentificator,
            name: profile.username,
            disable: profile.disabled,
          })),
        )
    );
  };

  /**
   * Get profiles
   *
   * @param {string} string The search string
   * @param {boolean} disabled The disabled flag
   * @param {boolean} notShowing The not showing flag
   * @return {SelectQueryBuilder<ProfileEntity>}
   */
  getProfiles = (search: string, disabled: boolean, notShowing: boolean): SelectQueryBuilder<ProfileEntity> => {
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
  byId = async (
    id: string,
    isRelations: boolean | 'manager' = true,
    cache = true,
  ): Promise<ProfileEntity | undefined> => {
    const where: FindConditions<ProfileEntity> = { id };
    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['manager'] : [];

    return this.profileRepository.findOne({
      where,
      relations,
      cache: cache ? { id: `profile_id_${id}`, milliseconds: this.dbCacheTtl } : false,
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
  byUsername = async (
    username: string,
    isRelations: boolean | 'manager' = true,
    cache = true,
  ): Promise<ProfileEntity | undefined> => {
    const where: FindConditions<ProfileEntity> = { username };
    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['manager'] : [];

    return this.profileRepository.findOne({
      where,
      relations,
      cache: cache ? { id: `profile_username_${username}`, milliseconds: this.dbCacheTtl } : false,
    });
  };

  /**
   * Profile by LoginIdentificator
   *
   * @async
   * @param {string} id LoginIdentificator (LDAP: ObjectGUID)
   * @param {boolean} cache From cache
   * @return {Promise<ProfileEntity | undefined>} Profile
   */
  byLoginIdentificator = async (
    loginIdentificator: string,
    isRelations: boolean | 'manager' = true,
    cache = true,
  ): Promise<ProfileEntity | undefined> => {
    const where: FindConditions<ProfileEntity> = { loginIdentificator };
    const relations = typeof isRelations === 'string' ? [isRelations] : isRelations ? ['manager'] : [];

    return this.profileRepository.findOne({
      where,
      relations,
      cache: cache ? { id: `profile_LI_${loginIdentificator}`, milliseconds: this.dbCacheTtl } : false,
    });
  };

  /**
   * searchSuggestions
   *
   * @async
   * @param {string} search Search string
   * @return {Promise<string[]>} The search suggestions
   * @throws {Error} Exception
   */
  searchSuggestions = async (search: string): Promise<string[]> => {
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
              .orWhere(`profile.telephone iLike ${cleared}`)
              .orWhere(`profile.workPhone iLike ${cleared}`)
              .orWhere(`profile.mobile iLike ${cleared}`);
          }),
        );
      }
    });

    const result = await query
      .orderBy('profile.lastName', 'ASC')
      .select([
        'profile.lastName',
        'profile.firstName',
        'profile.middleName',
        'profile.username',
        'profile.department',
        'profile.title',
        'profile.company',
        'profile.management',
        'profile.department',
        'profile.division',
        'profile.telephone',
        'profile.workPhone',
        'profile.mobile',
      ])
      .distinctOn([
        'profile.lastName',
        'profile.firstName',
        'profile.middleName',
        'profile.username',
        'profile.department',
        'profile.title',
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

    return result.reduce((accumulator: string[], current: ProfileEntity) => {
      // if (accumulator.length >= 10) return accumulator;

      const lower = search
        .toLowerCase()
        .split('+')
        .map((l) => l.trim());
      let showing = '';

      const fullName = `${current.lastName || ''} ${current.firstName || ''} ${current.middleName || ''}`.toLowerCase();

      if (lower.some((l) => fullName.includes(l))) {
        showing = current.fullName || '';
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
      }

      if (accumulator.includes(showing) || showing === '') return accumulator;

      return [...accumulator, showing];
    }, []);
  };

  /**
   * Create or update by user DN
   *
   * @async
   * @param {string} userByDN User by DN
   * @param {number} [count = 1] Count for manager
   * @returns {Promise<ProfileEntity | undefined>} Profile entity
   */
  async fromLdapDN(userByDN: string, count = 1): Promise<ProfileEntity | undefined> {
    if (count <= 10) {
      const ldapUser = await this.ldapService.searchByDN(userByDN);

      if (ldapUser) {
        return this.fromLdap(ldapUser, undefined, true, count + 1);
      }
    } else {
      this.logger.info(`The LDAP count > 10, manager is not inserted: ${userByDN}`);
    }

    return;
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
  async fromLdap(ldapUser: LdapResponseUser, profile?: ProfileEntity, save = true, count = 1): Promise<ProfileEntity> {
    const manager =
      ldapUser.manager && ldapUser.dn !== ldapUser.manager ? await this.fromLdapDN(ldapUser.manager, count) : undefined;

    let comment: Record<string, string>;
    try {
      comment = JSON.parse(ldapUser.comment);
    } catch {
      comment = {};
    }
    const { companyEng, nameEng, managementEng, departmentEng, divisionEng, positionEng, gender } = comment;

    const { birthday } = comment;
    const birthdayDate = !birthday || birthday === '' ? undefined : new Date(birthday);

    const thumbnailPhotoBuffer = ldapUser.thumbnailPhoto ? Buffer.from(ldapUser.thumbnailPhoto, 'base64') : undefined;

    const thumbnailPhoto = thumbnailPhotoBuffer
      ? this.imageService
          .imageResize(thumbnailPhotoBuffer, 250, 250)
          .then((img) => (img ? img.toString('base64') : undefined))
      : undefined;
    const thumbnailPhoto40 = thumbnailPhotoBuffer
      ? this.imageService.imageResize(thumbnailPhotoBuffer).then((img) => (img ? img.toString('base64') : undefined))
      : undefined;

    const displayName = 'displayName' in ldapUser && ldapUser.displayName.split(' ');
    const middleName = displayName && displayName.length === 3 ? displayName[2] : '';

    if (!profile) {
      // eslint-disable-next-line no-param-reassign
      profile = await this.byLoginIdentificator(ldapUser.objectGUID, false, false);
    }

    const data: Profile = {
      ...profile,
      dn: ldapUser.dn,
      username: ldapUser.sAMAccountName,
      loginService: LoginService.LDAP,
      loginIdentificator: ldapUser.objectGUID,
      firstName: ldapUser.givenName,
      lastName: ldapUser.sn,
      middleName,
      birthday: birthdayDate,
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
      manager: (manager as unknown) as Profile | undefined,
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
      accessCard: ldapUser['msDS-cloudExtensionAttribute13'],
      // eslint-disable-next-line no-bitwise
      disabled: !!(Number.parseInt(ldapUser.userAccountControl, 10) & 2),
      notShowing: Number.parseInt(ldapUser.flags, 10) === 1,
      thumbnailPhoto: (thumbnailPhoto as unknown) as string,
      thumbnailPhoto40: (thumbnailPhoto40 as unknown) as string,
      createdAt: new Date(ldapUser.whenCreated),
      updatedAt: new Date(ldapUser.whenChanged),
    };

    return save ? this.save(this.profileRepository.create(data)) : this.profileRepository.create(data);
  }

  /**
   * Create profile
   *
   * @param {Profile} profile Profile
   * @returns {Promise<ProfileEntity>} Profile entity
   */
  create = (profile: Profile): ProfileEntity => this.profileRepository.create(profile);

  /**
   * Bulk Save
   *
   * @async
   * @param {ProfileEntity[]} profiles The profile before save
   * @returns {Promise<ProfileEntity[]>} The profile after save
   * @throws {Error} Exception
   */
  bulkSave = async (profiles: ProfileEntity[]): Promise<ProfileEntity[]> =>
    this.profileRepository.save<ProfileEntity>(profiles).catch((error: Error) => {
      const message = error.toString();
      this.logger.error(`Unable to save data in "profile": ${message}`, [{ error }]);

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
  save = async (profile: ProfileEntity): Promise<ProfileEntity> =>
    this.profileRepository
      .save<ProfileEntity>(profile)
      .then((profile) => {
        if (profile && !profile.fullName) {
          const f: Array<string> = [];
          if (profile.lastName) {
            f.push(profile.lastName);
          }
          if (profile.firstName) {
            f.push(profile.firstName);
          }
          if (profile.middleName) {
            f.push(profile.middleName);
          }
          profile.fullName = f.join(' ');
        }
        return profile;
      })
      .catch((error: Error) => {
        const message = error.toString();
        this.logger.error(`Unable to save data in "profile": ${message}`, [{ error }]);

        throw error;
      });

  /**
   * Update
   *
   * @async
   */
  update = async (
    criteria: string | string[] | number | number[] | Date | Date[] | FindConditions<ProfileEntity>,
    partialEntity: QueryDeepPartialEntity<ProfileEntity>,
  ): Promise<UpdateResult> => this.profileRepository.update(criteria, partialEntity);

  /**
   * Profile field selection
   *
   * @async
   * @param {string} field Field: 'company' | 'management' | 'department' | 'division' | 'country' |
   *                              'region' | 'town' | 'street' | 'postalCode'
   * @returns {Promise<string[]>} Field selection
   * @throws {Error} Exception
   */
  fieldSelection = async (
    field: typeof PROFILE_AUTOCOMPLETE_FIELDS[number],
    department?: string,
  ): Promise<string[]> => {
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
  async changeProfile(
    request: Request,
    profile: Profile,
    thumbnailPhoto?: Promise<FileUpload>,
  ): Promise<ProfileEntity> {
    // В резолвере проверка на юзера уже есть
    if (!request.session?.passport?.user?.profile?.id) {
      throw new Error('Not authorized');
    }

    const updated = { id: request.session.passport.user.profile.id, ...profile };

    const created = await this.profileRepository.findOne(updated.id);
    if (!created) {
      throw new Error('Profile repository: "created" is null');
    }

    let ldapUser = await this.ldapService.searchByDN(created.dn);
    if (!ldapUser) {
      ldapUser = await this.ldapService.searchByDN(created.dn, false);
      if (!ldapUser) {
        ldapUser = await this.ldapService.searchByUsername(created.username, false);
        if (!ldapUser) {
          throw new Error('Ldap is not connected.');
        } else {
          created.dn = ldapUser.dn;
        }
      }
    }

    const modification: Record<string, any> = {
      comment: {},
    };

    if (profile) {
      Object.keys(profile).forEach((key) => {
        const value = this.clean(profile[key]);

        switch (key) {
          case 'firstName':
            modification.givenName = value;
            modification.displayName = [created.lastName, value, created.middleName].join(' ');
            break;
          case 'lastName':
            modification.sn = value;
            modification.displayName = [value, created.firstName, created.middleName].join(' ');
            break;
          case 'middleName':
            modification[key] = value;
            modification.displayName = [created.lastName, created.firstName, value].join(' ');
            break;
          case 'gender':
            if ([Gender.MAN, Gender.WOMAN].includes(value as number)) {
              modification.comment = { ...modification.comment, [key]: value === Gender.MAN ? 'M' : 'W' };
            }
            break;
          case 'birthday':
          case 'companyEng':
          case 'nameEng':
          case 'managementEng':
          case 'departmentEng':
          case 'divisionEng':
          case 'positionEng':
            modification.comment = { ...modification.comment, [key]: value };
            break;
          case 'country':
            modification.co = value;
            break;
          case 'town':
            modification.l = value;
            break;
          case 'region':
            modification.st = value;
            break;
          case 'street':
            modification.streetAddress = value;
            break;
          case 'email':
            modification.mail = value;
            break;
          case 'telephone':
            modification.telephoneNumber = value;
            break;
          case 'workPhone':
            modification.otherTelephone = value;
            break;
          case 'fax':
            modification.facsimileTelephoneNumber = value;
            break;
          case 'room':
            modification.physicalDeliveryOfficeName = value;
            break;
          case 'employeeID':
            modification.employeeID = value;
            break;
          case 'notShowing':
            modification.flags = value ? '1' : '0';
            break;
          case 'management':
            modification.department = value;
            break;
          case 'department':
            modification['msDS-cloudExtensionAttribute6'] = value;
            break;
          case 'division':
            modification['msDS-cloudExtensionAttribute7'] = value;
            break;
          // имена ключей совпадают
          case 'postalCode':
          case 'company':
          case 'title':
          case 'mobile':
            modification[key] = value;
            break;
          default:
            break;
        }
      });
    }

    if (Object.keys(modification.comment).length === 0) {
      delete modification.comment;
    } else {
      let oldComment = {};

      try {
        oldComment = JSON.parse(ldapUser.comment);
        // eslint-disable-next-line no-empty
      } catch {}

      modification.comment = JSON.stringify({ ...oldComment, ...modification.comment });
    }

    const ldapUpdated = Object.keys(modification).map(
      (key) =>
        new Change({
          operation: 'replace',
          modification: new Attribute({ type: key, vals: modification[key] }),
        }),
    );

    if (thumbnailPhoto) {
      await constructUploads([thumbnailPhoto], ({ file }) => {
        modification.thumbnailPhoto = file;

        return ldapUpdated.push(
          new Change({
            operation: 'replace',
            modification: new Attribute({ type: 'thumbnailPhoto', vals: file }),
          }),
        );
      });
    }

    if (ldapUpdated.length === 0) {
      throw new UnprocessableEntityException();
    }
    await this.ldapService
      .modify(
        ldapUser.dn,
        ldapUpdated,
        created.username,
        // TODO: .modify with password parameter
        // (req.session!.passport!.user as UserResponse)!.passwordFrontend,
      )
      .catch((error: Ldap.Error) => {
        if (error.name === 'InsufficientAccessRightsError') {
          throw new ForbiddenException();
        } else if (error.name === 'ConstraintViolationError') {
          throw new PayloadTooLargeException();
        }
        throw new BadRequestException();
      });

    const thumbnail = modification.thumbnailPhoto
      ? {
          thumbnailPhoto: modification.thumbnailPhoto.toString('base64'),
          thumbnailPhoto40: await this.imageService
            .imageResize(modification.thumbnailPhoto)
            .then((value: Buffer | undefined) => value?.toString('base64')),
        }
      : {};
    const result = this.profileRepository.merge(created, profile, thumbnail as ProfileEntity);

    return this.save(result).then(async (profileUpdated) => {
      if (request.session?.passport.user.profile.id === profileUpdated.id) {
        request.session.passport.user.profile = profileUpdated;
      }

      // TODO:  разобраться
      await this.profileRepository.manager.connection?.queryResultCache?.remove([
        'profile',
        'profile_id',
        'profile_LI',
        'profile_searchSuggestions',
        'profile_fieldSelection',
      ]);

      return profileUpdated;
    });
  }
}
