/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
// import { Request } from 'express';
// #endregion
// #region Imports Local
import { LdapResponeUser } from '../ldap/interfaces/ldap.interface';
import { ProfileEntity } from './profile.entity';
import { Gender, LoginService } from '../../lib/types';
import { Profile } from './models/profile.dto';
import { LogService } from '../logger/logger.service';
import { LdapService } from '../ldap/ldap.service';
import { UserEntity } from '../user/user.entity';
import { ImageService } from '../image/image.service';
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

  repository = (): Repository<ProfileEntity> => this.profileRepository;

  profiles = async (): Promise<ProfileEntity[]> =>
    this.profileRepository.find({ cache: true, where: { notShowing: false } });

  // profiles = async (
  //   take: number,
  //   skip: number,
  //   orderBy = 'name',
  //   order = 'ASC',
  //   isNotShowing = true,
  // ): Promise<ProfileEntity[]> => {
  //   const where = isNotShowing ? { notShowing: false } : undefined;
  //   return this.profileRepository.find({
  //     cache: true,
  //     take,
  //     skip,
  //     where,
  //     order: {
  //       [orderBy === 'name' ? 'lastName' : orderBy]: order.toUpperCase(),
  //     },
  //   });
  // };

  /**
   * Profile by ID
   *
   * @param id string
   * @return Profile
   */
  profile = async (id: string): Promise<ProfileEntity | undefined> =>
    this.profileRepository.findOne(id, { cache: true });

  // TODO: добавить disabled (хз как) и фильтрацию по addressPersonal??????
  profilesSearch = async (
    search: string,
    orderBy: string,
    order: string,
    isNotShowing = true,
  ): Promise<ProfileEntity[]> => {
    let where: Record<any, any> = [
      { firstName: Like(`%${search}%`) },
      { lastName: Like(`%${search}%`) },
      { middleName: Like(`%${search}%`) },
      { department: Like(`%${search}%`) },
      { company: Like(`%${search}%`) },
      { telephone: Like(`%${search}%`) },
      { workPhone: Like(`%${search}%`) },
      { mobile: Like(`%${search}%`) },
    ];
    if (isNotShowing) {
      where = where.map((value: Record<any, any>) => ({ ...value, notShowing: false }));
    }

    return this.profileRepository.find({
      cache: true,
      order: {
        [orderBy === 'name' ? 'lastName' : orderBy]: order.toUpperCase(),
      },
      where,
    });
  };

  /**
   * Create or update by user DN
   * @param userByDN string
   * @returns string
   */
  async createLdapDN(userByDN: string): Promise<ProfileEntity | undefined> {
    const ldapUser = await this.ldapService.searchByDN(userByDN);

    if (ldapUser) {
      return this.create(ldapUser, undefined);
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
  async create(ldapUser: LdapResponeUser, user?: UserEntity): Promise<ProfileEntity | undefined> {
    const manager = ldapUser.manager ? await this.createLdapDN(ldapUser.manager) : undefined;

    let comment;
    try {
      comment = JSON.parse(ldapUser.comment);
    } catch (error) {
      comment = {};
    }
    const {
      companyeng: companyEng = undefined,
      nameeng: nameEng = undefined,
      departmenteng: departmentEng = undefined,
      otdeleng: otdelEng = undefined,
      positioneng: positionEng = undefined,
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
}
