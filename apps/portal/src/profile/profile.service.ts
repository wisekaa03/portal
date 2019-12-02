/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, SelectQueryBuilder } from 'typeorm';
// import { Request } from 'express';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ImageService } from '@app/image';
import { LdapService, LdapResponeUser } from '@app/ldap';
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
  async createFromLdap(ldapUser: LdapResponeUser, user?: UserEntity, count = 1): Promise<ProfileEntity | undefined> {
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

    const profile: Profile = {
      dn: ldapUser.dn,
      loginService: LoginService.LDAP,
      loginIdentificator: ldapUser.objectGUID.toString(),
      username: ldapUser.sAMAccountName,
      firstName: ldapUser.givenName,
      lastName: ldapUser.sn,
      middleName: ldapUser.middleName,
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

    let profileEnt;
    try {
      profileEnt = this.profileRepository.create(profile);
    } catch (error) {
      this.logService.error('Unable to create data in `profile`', error, 'ProfileService');

      throw error;
    }

    try {
      return await this.profileRepository.save(profileEnt);
    } catch (error) {
      this.logService.error('Unable to save data in `profile`', error, 'ProfileService');

      throw error;
    }
  }

  /**
   * changeProfile
   * @param id string
   * @param value any
   * @returns boolean | null
   */
  async changeProfile(id: string, value: any): Promise<boolean | null> {
    return null;
  }
}
