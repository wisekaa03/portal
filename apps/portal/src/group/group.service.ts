/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapResonseGroup, LdapResponseUser } from '@app/ldap';
import { GroupEntity } from './group.entity';
import { Group } from './models/group.dto';
import { LoginService } from '../shared/interfaces';
// #endregion

@Injectable()
export class GroupService {
  constructor(
    private readonly logService: LogService,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  async createFromUser(ldap: LdapResponseUser): Promise<GroupEntity[]> {
    let groups: GroupEntity[] = [];

    if (ldap.groups) {
      const promises = (ldap.groups as LdapResonseGroup[]).map(async (ldapGroup: LdapResonseGroup) => {
        const updateAt = await this.groupRepository.findOne({ loginIdentificator: ldapGroup.objectGUID });

        const group: Group = {
          ...updateAt,
          loginIdentificator: ldapGroup.objectGUID,
          name: ldapGroup.sAMAccountName as string,
          dn: ldapGroup.dn,
          loginService: LoginService.LDAP,
        };

        let update: GroupEntity;
        try {
          update = this.groupRepository.create(group);
        } catch (error) {
          this.logService.error('Group create error:', error, 'GroupService');

          throw error;
        }

        try {
          return this.groupRepository.save(update);
        } catch (error) {
          this.logService.error('Unable to save data in `group`', error, 'GroupService');

          throw error;
        }
      });

      groups = await Promise.all(promises);
    }

    return groups;
  }
}
