/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder } from 'typeorm';
import Ldap from 'ldapjs';
import { Request } from 'express';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ImageService } from '@app/image';
import { LdapService, LdapResponseUser } from '@app/ldap';
import { ProfileEntity } from './profile.entity';
import { Profile } from './models/profile.dto';
import { UserEntity } from '../user/user.entity';
import { LoginService, Gender } from '../shared/interfaces';
import { GQLErrorCode } from '../shared/gqlerror';
import { constructUploads } from '../shared/upload';
// #endregion

@Injectable()
export class ProfileService {
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

  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly logService: LogService,
    private readonly imageService: ImageService,
    private readonly ldapService: LdapService,
  ) {}

  /**
   * Get profiles
   *
   * @param {string} string - The search string
   * @param {boolean} disabled - The disabled
   * @param {boolean} notShowing - The not showing
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
              .orWhere(`profile.department iLike ${cleared}`)
              .orWhere(`profile.company iLike ${cleared}`)
              .orWhere(`profile.otdel iLike ${cleared}`)
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
   * @param id string
   * @return Profile
   */
  profile = async (id: string): Promise<ProfileEntity | undefined> =>
    this.profileRepository.findOne(id, { relations: ['manager'], cache: true });

  /**
   * Profile by Identificator
   *
   * @param loginIdentificator string
   * @return Profile
   */
  profileByIdentificator = async (loginIdentificator: string): Promise<ProfileEntity | undefined> =>
    this.profileRepository.findOne({ where: { loginIdentificator }, cache: true });

  /**
   * searchSuggestions
   *
   * @param {string} - Search string
   * @throws {Error} - Exception
   */
  searchSuggestions = async (search: string): Promise<string[]> => {
    const query = this.profileRepository
      .createQueryBuilder('profile')
      .where('profile.notShowing = :notShowing')
      .andWhere('profile.disabled = :disabled');

    search.split('+').forEach((value) => {
      const cleared = value.trim() !== '' ? `'%${value.trim()}%'` : '';

      if (cleared) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where(`profile.lastName || ' ' || profile.firstName || ' ' || profile.middleName iLike ${cleared}`)
              .orWhere(`profile.username iLike ${cleared}`)
              .orWhere(`profile.department iLike ${cleared}`)
              .orWhere(`profile.company iLike ${cleared}`)
              .orWhere(`profile.otdel iLike ${cleared}`)
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
      .distinctOn([
        'profile.lastName',
        'profile.firstName',
        'profile.middleName',
        'profile.username',
        'profile.department',
        'profile.title',
        'profile.company',
        'profile.otdel',
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

    return result.reduce((accumulator: string[], cur: ProfileEntity) => {
      if (accumulator.length >= 7) return accumulator;

      const lower = search
        .toLowerCase()
        .split('+')
        .map((l) => l.trim());
      let showing = '';

      if (lower.some((l) => cur.fullName.toLowerCase().includes(l))) {
        showing = cur.fullName || '';
      } else if (lower.some((l) => cur.department && cur.department.toLowerCase().includes(l))) {
        showing = cur.department || '';
      } else if (lower.some((l) => cur.company && cur.company.toLowerCase().includes(l))) {
        showing = cur.company || '';
      } else if (lower.some((l) => cur.title && cur.title.toLowerCase().includes(l))) {
        showing = cur.title || '';
      }

      if (accumulator.includes(showing) || showing === '') return accumulator;

      return [...accumulator, showing];
    }, []);
  };

  /**
   * Create or update by user DN
   *
   * @param {string} - User by DN
   * @param {number} - Count
   * @returns {ProfileEntity}
   */
  async createLdapDN(userByDN: string, count: number): Promise<ProfileEntity | undefined> {
    if (count <= 10) {
      const ldapUser = await this.ldapService.searchByDN(userByDN);

      if (ldapUser) {
        return this.createFromLdap(ldapUser, undefined, count + 1);
      }
    } else {
      this.logService.log(`The LDAP count > 10, manager is not inserted: ${userByDN}`, 'ProfileService');
    }

    return undefined;
  }

  /**
   * Create or Update user profiles
   *
   * @param {LdapResponseUser} - The LDAP user
   * @param {UserEntity} - User from Database
   * @returns {ProfileEntity} - The profile entity
   * @throws {Error} - Exception
   */
  async createFromLdap(ldapUser: LdapResponseUser, user?: UserEntity, count = 1): Promise<ProfileEntity | undefined> {
    const manager =
      ldapUser.manager && ldapUser.dn !== ldapUser.manager
        ? await this.createLdapDN(ldapUser.manager, count)
        : undefined;

    let comment: any;
    try {
      comment = JSON.parse(ldapUser.comment);
    } catch (error) {
      comment = {};
    }
    const {
      companyeng = undefined,
      nameeng = undefined,
      departmenteng = undefined,
      otdeleng = undefined,
      positioneng = undefined,
      gender = undefined,
    } = comment;

    let { birthday } = comment;
    birthday = !birthday || birthday === '' ? undefined : new Date(Date.parse(birthday));

    const thumbnailPhotoBuffer = ldapUser.thumbnailPhoto ? Buffer.from(ldapUser.thumbnailPhoto, 'base64') : undefined;

    const thumbnailPhoto = thumbnailPhotoBuffer
      ? this.imageService
          .imageResize(thumbnailPhotoBuffer, 250, 250)
          .then((img) => (img ? img.toString('base64') : undefined))
      : undefined;
    const thumbnailPhoto40 = thumbnailPhotoBuffer
      ? this.imageService.imageResize(thumbnailPhotoBuffer).then((img) => (img ? img.toString('base64') : undefined))
      : undefined;

    const [department, otdel] = ldapUser.department ? ldapUser.department.split(/\s*,\s*/, 2) : [undefined, undefined];

    const displayName = 'displayName' in ldapUser && ldapUser.displayName.split(' ');
    const middleName = displayName && displayName.length === 3 ? displayName[2] : '';

    const profile: Profile = {
      dn: ldapUser.dn,
      loginService: LoginService.LDAP,
      loginIdentificator: ldapUser.objectGUID,
      username: ldapUser.sAMAccountName,
      firstName: ldapUser.givenName,
      lastName: ldapUser.sn,
      middleName,
      birthday,
      gender: gender === 'M' ? Gender.MAN : gender === 'W' ? Gender.WOMAN : Gender.UNKNOWN,
      country: ldapUser.co,
      postalCode: ldapUser.postalCode,
      town: ldapUser.l,
      region: ldapUser.st,
      street: ldapUser.streetAddress,
      company: ldapUser.company,
      department,
      otdel,
      title: ldapUser.title,
      manager: (manager as unknown) as Profile | undefined,
      email: ldapUser.mail,
      telephone: ldapUser.telephoneNumber,
      workPhone: ldapUser.otherTelephone,
      mobile: ldapUser.mobile,
      fax: ldapUser.facsimileTelephoneNumber,
      room: ldapUser.physicalDeliveryOfficeName,
      employeeID: ldapUser.employeeID,
      companyeng,
      nameeng,
      departmenteng,
      otdeleng,
      positioneng,
      // eslint-disable-next-line no-bitwise
      disabled: !!(parseInt(ldapUser.userAccountControl, 10) & 2),
      notShowing: !!(parseInt(ldapUser.flags, 10) === 1),
      thumbnailPhoto: (thumbnailPhoto as unknown) as string,
      thumbnailPhoto40: (thumbnailPhoto40 as unknown) as string,
    };

    if (user && user.profile) {
      profile.id = user.profile.id;
      // profile.createdAt = user.profile.createdAt;
      // profile.updatedAt = user.profile.updatedAt;
    } else {
      const profileSave = await this.profileRepository.findOne({
        where: { loginIdentificator: ldapUser.objectGUID },
      });

      profile.createdAt = new Date(ldapUser.whenCreated);
      profile.updatedAt = new Date(ldapUser.whenChanged);

      if (profileSave) {
        profile.id = profileSave.id;
        // profile.createdAt = profileSave.createdAt;
        // profile.updatedAt = profileSave.updatedAt;
      }
    }

    return this.save(this.profileRepository.create(profile));
  }

  /**
   * Create profile
   *
   * @param {Profile} - Profile
   * @returns {ProfileEntity} - Profile entity
   */
  create = async (profile: Profile): Promise<ProfileEntity> => this.profileRepository.create(profile);

  /**
   * Bulk Save
   *
   * @param {ProfileEntity[]} - The profiles
   * @returns {ProfileEntity[]} - The profiles
   */
  bulkSave = async (profile: ProfileEntity[]): Promise<ProfileEntity[]> =>
    this.profileRepository.save<ProfileEntity>(profile).catch((error: Error) => {
      this.logService.error('Unable to save data(s) in `profile`', JSON.stringify(error), 'ProfileService');

      throw error;
    });

  /**
   * Save
   *
   * @param {ProfileEntity} - The profile
   * @returns {ProfileEntity} - The profile
   * @throws {Error} - Exception
   */
  save = async (profile: ProfileEntity): Promise<ProfileEntity> =>
    this.profileRepository.save<ProfileEntity>(profile).catch((error: Error) => {
      this.logService.error('Unable to save data in `profile`', JSON.stringify(error), 'ProfileService');

      throw error;
    });

  /**
   * Profile field selection
   *
   * @param {string} fieldSelection - the field selection
   * @returns {string[]} - Field selection
   * @throws {Error} - Exception
   */
  fieldSelection = async (
    field: 'company' | 'department' | 'otdel' | 'country' | 'region' | 'town' | 'street' | 'postalCode',
  ): Promise<string[]> => {
    const query = this.profileRepository.createQueryBuilder('profile');

    const result = await query
      .orderBy(`profile.${field}`, 'ASC')
      .distinctOn([`profile.${field}`])
      .cache(true)
      .getMany();

    return result.reduce((accumulator: string[], cur: ProfileEntity) => {
      if (typeof cur[field] === 'string' && cur[field]) {
        return [...accumulator, cur[field] || ''];
      }

      return accumulator;
    }, []);
  };

  /**
   * changeProfile
   * @param {Request} req - Express Request
   * @param {Profile} profile - Profile params
   * @param {Promise<FileUpload>} thumbnailPhoto - Avatar
   * @returns {ProfileEntity} - The corrected ProfileEntity
   * @throws {Error} - Exception
   */
  async changeProfile(req: Request, profile: Profile, thumbnailPhoto?: Promise<FileUpload>): Promise<ProfileEntity> {
    // В резолвере проверка на юзера уже есть
    if (!req.session!.passport!.user!.profile!.id) {
      throw new Error('Not authorized');
    }

    const updated = { id: req.session!.passport.user.profile.id, ...profile };

    const created = await this.profileRepository.findOne(updated.id);
    if (!created) {
      throw new Error('Profile repository: "created" is null');
    }

    const ldapUser = await this.ldapService.searchByDN(created.dn);
    if (!ldapUser) {
      throw new Error('Ldap is not connected.');
    }

    const modification: any = {
      comment: {},
    };

    const clean = (value: any): string | number | boolean => {
      // TODO: продумать варианты отчистки и безопасности
      return typeof value === 'string' ? value.trim() : value;
    };

    if (thumbnailPhoto) {
      await Promise.all(
        await constructUploads([thumbnailPhoto], ({ /* filename, */ file }) => {
          // TODO: сохранить в профиле пользователя картинку
          modification.thumbnailPhoto = file;
        }),
      ).catch((error: Error) => {
        this.logService.error(error.message, JSON.stringify(error), 'OldTicketService');

        throw error;
      });
    }

    if (profile) {
      Object.keys(profile).forEach((key) => {
        const value = clean((profile as any)[key]);

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
          case 'companyeng':
          case 'nameeng':
          case 'departmenteng':
          case 'otdeleng':
          case 'positioneng':
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
          case 'department':
          case 'otdel':
            created[key] = value as string;
            modification.department = [created.department, created.otdel].join(', ');
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
      // если сломался синтаксис, в адешке все перепишется
      let oldComment = {};

      try {
        oldComment = JSON.parse(ldapUser.comment);
        // eslint-disable-next-line no-empty
      } catch (_) {}

      modification.comment = JSON.stringify({ ...oldComment, ...modification.comment });
    }

    if (!Object.keys(modification).length) {
      throw new Error(GQLErrorCode.NO_FIELDS_ARE_FILLED_WITH_PROFILE);
    }

    const ldapUpdated = Object.keys(modification).map(
      (key) =>
        new Ldap.Change({
          operation: 'replace',
          modification: { [key]: modification[key] },
        }),
    );

    await this.ldapService
      .modify(
        created.dn,
        ldapUpdated,
        created.username,
        // TODO: .modify with password parameter
        // (req.session!.passport!.user as UserResponse)!.passwordFrontend,
      )
      .catch((error: Ldap.Error) => {
        if (error.name === 'InsufficientAccessRightsError') {
          throw new Error(GQLErrorCode.INSUFF_RIGHTS_AD);
        } else if (error.name === 'ConstraintViolationError') {
          throw new Error(GQLErrorCode.CONSTRAINT_VIOLATION_ERROR);
        }
        throw new Error(GQLErrorCode.SERVER_PARAMS);
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

    if (req.session!.passport.user.profile.id === result.id) {
      req.session!.passport.user.profile = result;
    }

    return this.save(result);
  }
}
