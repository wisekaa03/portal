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
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly logService: LogService,
    private readonly imageService: ImageService,
    private readonly ldapService: LdapService,
  ) {}

  async profiles(take: number, skip: number): Promise<Profile[]> {
    // TODO: группы к которым имеет доступ текущий пользователь, согласно username

    const profiles = await this.profileRepository.find({
      cache: true,
      take,
      skip,
    });

    return profiles;
  }

  async profile(id: string): Promise<Profile | null> {
    const profile = await this.profileRepository.findOne(id, { cache: true });

    return profile as Profile | null;
  }

  profilesSearch = async (search: string): Promise<Profile[]> =>
    this.profileRepository.find({
      cache: true,
      where: [
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
        { middleName: Like(`%${search}%`) },
        { department: Like(`%${search}%`) },
        { company: Like(`%${search}%`) },
        { telephone: Like(`%${search}%`) },
        { workPhone: Like(`%${search}%`) },
        { mobile: Like(`%${search}%`) },
      ],
    });

  async create(ldapUser: LdapResponeUser, user?: UserEntity): Promise<ProfileEntity | undefined> {
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
    if (!birthday || birthday === '') {
      birthday = undefined;
    } else {
      birthday = new Date(Date.parse(birthday)).toLocaleDateString();
    }

    const thumbnailPhoto = ldapUser.thumbnailPhoto
      ? this.imageService.imageResize(Buffer.from(ldapUser.thumbnailPhoto, 'base64'), 250, 250)
      : undefined;

    let profile: Profile = {
      loginService: LoginService.LDAP,
      loginIdentificator: ldapUser.objectGUID.toString(),
      username: ldapUser.sAMAccountName,
      firstName: ldapUser.givenName,
      lastName: ldapUser.sn,
      middleName: ldapUser.middleName,
      birthday,
      gender: gender === 'M' ? Gender.MAN : gender === 'W' ? Gender.WOMAN : Gender.UNKNOWN,
      addressPersonal: {
        country: ldapUser.co,
        postalCode: ldapUser.postalCode,
        region: ldapUser.st,
        street: ldapUser.streetAddress,
      },
      company: ldapUser.company,
      department: ldapUser.department,
      title: ldapUser.title,
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
      thumbnailPhoto,
    };

    if (user && user.profile) {
      profile.id = user.profile.id;
      profile.createdAt = user.profile.createdAt;
      profile.updatedAt = user.profile.updatedAt;
    } else {
      const profileSave = await this.profileRepository.findOne({
        where: { loginIdentificator: ldapUser.objectGUID.toString() },
      });

      if (profileSave) {
        profile.id = profileSave.id;
        profile.createdAt = profileSave.createdAt;
        profile.updatedAt = profileSave.updatedAt;
      }
    }

    try {
      profile = this.profileRepository.create(profile);
    } catch (error) {
      this.logService.error('Unable to create data in `profile`', error, 'ProfileService');

      throw error;
    }

    try {
      return await this.profileRepository.save(profile);
    } catch (error) {
      this.logService.error('Unable to save data in `profile`', error, 'ProfileService');

      throw error;
    }
  }
}
