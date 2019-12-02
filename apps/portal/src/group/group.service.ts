/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { LdapResponeUser, LdapResonseGroup } from '@app/ldap';
import { UserEntity } from '../user/user.entity';
import { GroupEntity } from './group.entity';
import { Group } from './models/group.dto';
import { LoginService } from '../shared/interfaces';
// #endregion

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  async createFromUser(ldap: LdapResponeUser, user?: UserEntity): Promise<GroupEntity[] | undefined> {
    let groups: GroupEntity[] | undefined;

    if (ldap.groups) {
      await (ldap.groups as LdapResonseGroup[]).forEach(async (ldapGroup) => {
        const group: Group = {
          name: ldapGroup.sAMAccountName as string,
          dn: ldapGroup.dn,
          loginService: LoginService.LDAP,
          loginIdentificator: ldapGroup.objectGUID,
        };

        if (user) {
          const groupBase = await this.groupRepository.findOne({ loginIdentificator: ldapGroup.objectGUID });
          if (groupBase) {
            group.id = groupBase.id;
          }
        }

        // groups.push();
      });
    }

    return groups;
  }
}
