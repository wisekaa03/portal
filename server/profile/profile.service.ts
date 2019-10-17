/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { LdapResponeUser } from '../ldap/interfaces/ldap.interface';
import { ProfileEntity } from './profile.entity';
import { Gender, LoginService } from '../../lib/types';
import { ProfileDTO } from './models/profile.dto';
import { LogService } from '../logger/logger.service';
// #endregion

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,
    private readonly logService: LogService,
  ) {}

  async create(ldapUser: LdapResponeUser): Promise<ProfileDTO | undefined> {
    let comment;
    let p;

    try {
      comment = JSON.parse(ldapUser.comment);
    } catch (error) {
      comment = {};
    }

    const { companyeng, nameeng, departmenteng, otdeleng, positioneng, birthday, gender } = comment;

    const profile = {
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
      thumbnailPhoto: Buffer.from(ldapUser.thumbnailPhoto),
    };

    try {
      p = this.profileRepository.create(profile);
    } catch (error) {
      this.logService.error('Unable to create data in `profile`', error);

      throw error;
    }

    try {
      return await this.profileRepository.save(p);
    } catch (error) {
      this.logService.error('Unable to save data in `profile`', error);

      throw error;
    }
  }
}
