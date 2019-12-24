/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder } from 'typeorm';
import Ldap from 'ldapjs';
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
      companyEng = undefined,
      nameEng = undefined,
      departmentEng = undefined,
      otdelEng = undefined,
      positionEng = undefined,
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
      companyEng,
      nameEng,
      departmentEng,
      otdelEng,
      positionEng,
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
   * @param id Profile ID
   * @param profile Profile
   * @returns boolean | null
   */
  async changeProfile(id: string, profile: Profile): Promise<boolean | null> {
    const updated = { id, ...profile };

    const created = await this.profileRepository.findOne(updated.id);

    if (!created) {
      return false;
    }

    const ldapUser = await this.ldapService.searchByDN(created.dn);

    if (!ldapUser) {
      return false;
    }

    let comment: any;
    try {
      comment = JSON.parse(ldapUser.comment);
    } catch (error) {
      comment = {};
    }

    const modification: any = {};

    const clean = (value: any): string | number | boolean => {
      return typeof value === 'string' ? value.trim() : value;
    };

    Object.keys(profile).forEach((key) => {
      const value = clean((profile as any)[key]);

      switch (key) {
        case 'firstName':
          modification.givenName = value;
          break;
        case 'lastName':
          modification.sn = value;
          break;
        case 'middleName':
          modification.middleName = value;
          modification.displayName = [created.lastName, created.firstName, value].join(' ');
          break;
        case 'birthday':
          // TODO: пока непонятно в каком формате хранить в ldap
          break;
        case 'gender':
          if ([Gender.MAN, Gender.WOMAN].includes(value as number)) {
            modification.comment = { ...comment, gender: value === Gender.MAN ? 'M' : 'W' };
          }
          break;
        case 'companyEng':
        case 'nameEng':
        case 'departmentEng':
        case 'otdelEng':
        case 'positionEng':
          modification.comment = { ...comment, [key]: value };
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
          // TODO: тоже доделать
          // modification.flags;
          break;
        case 'thumbnailPhoto':
          // TODO: преобразовать из буфера
          break;
        case 'department':
        case 'otdel':
          // TODO: посмотреть как хранится
          // modification.department =
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

    // eslint-disable-next-line no-debugger
    debugger;
    // TODO: отладить и только после сохранять
    // const ldapUpdated = new Ldap.Change({
    //   operation: 'replace',
    //   modification,
    // });
    // if (await this.ldapService.modify(created.dn, ldapUpdated, created.username)) {
    //   await this.save({ ...created, ...profile });
    // }

    return true;
  }
}
