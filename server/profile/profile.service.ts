/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
// #endregion
// #region Imports Local
import { LdapResponeUser } from '../ldap/interfaces/ldap.interface';
import { ProfileEntity } from './profile.entity';
import { Gender, LoginService } from '../../lib/types';
import { Profile } from './models/profile.dto';
import { LogService } from '../logger/logger.service';
import { LdapService } from '../ldap/ldap.service';
import { UserEntity } from '../user/user.entity';
// #endregion

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly logService: LogService,
    private readonly ldapService: LdapService,
  ) {}

  async profiles(_req: Request): Promise<Profile[] | null> {
    // TODO: группы к которым имеет доступ текущий пользователь, согласно username

    const profiles = await this.profileRepository.find({
      cache: true,
    });

    return profiles;
  }

  async synch(_req: Request): Promise<boolean | null> {
    const users = await this.ldapService.synchronization();

    // TODO: обработка синхронизации - записать в базу все поля

    if (users) {
      return true;
    }

    return false;
  }

  async create(ldapUser: LdapResponeUser, user?: UserEntity): Promise<ProfileEntity | undefined> {
    let comment;

    try {
      comment = JSON.parse(ldapUser.comment);
    } catch (error) {
      comment = {};
    }

    const { companyeng, nameeng, departmenteng, otdeleng, positioneng, birthday, gender } = comment;

    let profile: Profile = {
      id: user && user.profile && user.profile.id,
      createdAt: user && user.profile && user.profile.createdAt,
      updatedAt: user && user.profile && user.profile.updatedAt,
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
      title: ldapUser.title,
      email: ldapUser.mail,
      telephone: ldapUser.telephoneNumber,
      workPhone: ldapUser.otherTelephone,
      mobile: ldapUser.mobile,
      thumbnailPhoto: Buffer.from(ldapUser.thumbnailPhoto, 'binary'),
    };

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
