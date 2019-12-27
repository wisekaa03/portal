/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder } from 'typeorm';
import Ldap from 'ldapjs';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ImageService } from '@app/image';
import { LdapService, LdapResponseUser } from '@app/ldap';
import { ProfileEntity } from './profile.entity';
import { Profile } from './models/profile.dto';
import { UserEntity } from '../user/user.entity';
import { LoginService, Gender } from '../shared/interfaces';
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

  getProfiles = (search: string, disabled: boolean, notShowing: boolean): SelectQueryBuilder<ProfileEntity> => {
    const query = this.profileRepository.createQueryBuilder('profile').leftJoinAndSelect('profile.manager', 'manager');

    const parameters = { search: `%${search}%`, notShowing, disabled };

    if (!disabled) {
      query.andWhere('profile.disabled = :disabled');
    }

    if (!notShowing) {
      query.andWhere('profile.notShowing = :notShowing');
    }

    if (search !== '') {
      query.andWhere(
        new Brackets((qb) => {
          qb.where("profile.lastName || ' ' || profile.firstName || ' ' || profile.middleName iLike :search")
            .orWhere('profile.department iLike :search')
            .orWhere('profile.company iLike :search')
            .orWhere('profile.title iLike :search')
            .orWhere('profile.telephone iLike :search')
            .orWhere('profile.workPhone iLike :search')
            .orWhere('profile.mobile iLike :search');
        }),
      );
    }

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
   * @param search string
   */
  searchSuggestions = async (search: string): Promise<ProfileEntity[]> => {
    // TODO: сейчас уникализация на клиенте, продумать или оставить так
    return (
      this.profileRepository
        .createQueryBuilder('profile')
        // .select(
        // eslint-disable-next-line max-len
        //   'DISTINCT profile.firstName, profile.lastName, profile.middleName, profile.department, profile.company, profile.title',
        // )
        .where('profile.notShowing = :notShowing')
        .andWhere('profile.disabled = :disabled')
        .andWhere(
          new Brackets((qb) => {
            qb.where("profile.lastName || ' ' || profile.firstName || ' ' || profile.middleName iLike :search")
              .orWhere('profile.department iLike :search')
              .orWhere('profile.company iLike :search')
              .orWhere('profile.title iLike :search');
          }),
        )
        .orderBy('profile.lastName', 'ASC')
        .setParameters({
          search: `%${search}%`,
          notShowing: false,
          disabled: false,
        })
        // .limit(5)
        .cache(true)
        .getMany()
    );
  };

  /**
   * Create or update by user DN
   * @param userByDN string
   * @returns string
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
   * @param ldapUser LdapResponseUser
   * @param user UserEntity
   * @returns ProfileEntity
   */
  async createFromLdap(ldapUser: LdapResponseUser, user?: UserEntity, count = 1): Promise<ProfileEntity | undefined> {
    const manager =
      ldapUser.manager && ldapUser.dn !== ldapUser.manager
        ? await this.createLdapDN(ldapUser.manager, count)
        : undefined;

    let comment;
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

    /* eslint-disable prettier/prettier */
    const thumbnailPhoto = thumbnailPhotoBuffer
      ? this.imageService
        .imageResize(thumbnailPhotoBuffer, 250, 250)
        .then((img) => (img ? img.toString('base64') : undefined))
      : undefined;
    /* eslint-enable prettier/prettier */
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
      profile.createdAt = user.profile.createdAt;
      profile.updatedAt = user.profile.updatedAt;
    } else {
      const profileSave = await this.profileRepository.findOne({
        where: { loginIdentificator: ldapUser.objectGUID },
      });

      if (profileSave) {
        profile.id = profileSave.id;
        profile.createdAt = profileSave.createdAt;
        profile.updatedAt = profileSave.updatedAt;
      }
    }

    return this.save(this.create(profile));
  }

  /**
   * Create
   *
   * @param {Profile} The profile
   * @returns {ProfileEntity} The profile
   */
  create = (profile: Profile): ProfileEntity => {
    try {
      return this.profileRepository.create(profile);
    } catch (error) {
      this.logService.error('Unable to create data in `profile`', error, 'ProfileService');

      throw error;
    }
  };

  /**
   * Bulk Save
   *
   * @param {ProfileEntity[]} The profiles
   * @returns {ProfileEntity[] | undefined} The profiles
   */
  bulkSave = async (profile: ProfileEntity[]): Promise<ProfileEntity[] | undefined> => {
    try {
      return this.profileRepository.save(profile);
    } catch (error) {
      this.logService.error('Unable to save data in `profile`', error.toString(), 'ProfileService');

      throw error;
    }
  };

  /**
   * Save
   *
   * @param {ProfileEntity} The profile
   * @returns {ProfileEntity | undefined} The profile
   */
  save = async (profile: ProfileEntity): Promise<ProfileEntity | undefined> => {
    try {
      return this.profileRepository.save(profile);
    } catch (error) {
      this.logService.error('Unable to save data in `profile`', error.toString(), 'ProfileService');

      throw error;
    }
  };

  /**
   * changeProfile
   * @param {req} Request
   * @param {profile} Profile
   * @returns {boolean | null}
   */
  async changeProfile(req: Request, profile: Profile): Promise<boolean | null> {
    // В резолвере проверка на юзера уже есть
    if (!req.session!.passport.user.profile || !req.session!.passport.user.profile.id) {
      return false;
    }

    const updated = { id: req.session!.passport.user.profile.id, ...profile };

    const created = await this.profileRepository.findOne(updated.id);

    if (!created) {
      return false;
    }

    const ldapUser = await this.ldapService.searchByDN(created.dn);

    if (!ldapUser) {
      return false;
    }

    const modification: any = {
      comment: {},
    };

    const clean = (value: any): string | number | boolean => {
      // TODO: продумать варианты отчистки и безопасности
      return typeof value === 'string' ? value.trim() : value;
    };

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
        case 'notShowing':
          modification.flags = value ? '1' : '0';
          break;
        case 'thumbnailPhoto':
          // eslint-disable-next-line no-case-declarations
          const thumbnailPhotoBuffer = Buffer.from(value as string, 'base64');

          /* eslint-disable prettier/prettier */
          created.thumbnailPhoto = thumbnailPhotoBuffer
            ? this.imageService
              .imageResize(thumbnailPhotoBuffer, 250, 250)
              .then((img) => (img ? img.toString('base64') : undefined))
            : undefined;
          created.thumbnailPhoto40 = thumbnailPhotoBuffer
            ? this.imageService
              .imageResize(thumbnailPhotoBuffer)
              .then((img) => (img ? img.toString('base64') : undefined))
            : undefined;
          /* eslint-enable prettier/prettier */

          modification[key] = value as string;
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

    if (Object.keys(modification.comment).length === 0) {
      delete modification.comment;
    } else {
      // TODO: если сломался синтаксис, в адешке все перепишется
      let oldComment = {};

      try {
        oldComment = JSON.parse(ldapUser.comment);
        // eslint-disable-next-line no-empty
      } catch (_) {}

      modification.comment = JSON.stringify({ ...oldComment, ...modification.comment });
    }

    const ldapUpdated = Object.keys(modification).map(
      (key) =>
        new Ldap.Change({
          operation: 'replace',
          modification: { [key]: modification[key] },
        }),
    );

    // eslint-disable-next-line no-debugger
    debugger;

    if (await this.ldapService.modify(created.dn, ldapUpdated, created.username)) {
      const result = this.profileRepository.merge(created, profile);

      if (req.session!.passport.user.profile.id === result.id) {
        req.session!.passport.user.profile = result;
      }

      await this.save(result);
    }

    return true;
  }
}
