/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Ldap from 'ldapjs';
// #endregion
// #region Imports Local
import { LdapResponeUser } from '@app/ldap';
import { UserEntity } from '../user/user.entity';
import { GroupEntity } from './group.entity';
import { Group } from './models/group.dto';
// #endregion

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  async createFromUser(ldap: LdapResponeUser, user?: UserEntity): Promise<GroupEntity[] | undefined> {
    ((ldap.groups as unknown) as Ldap.SearchEntryObject[]).forEach(async (ldapGroup) => {
      const group: Group = {
        name: ldapGroup.sAMAccountName as string,
        dn: ldapGroup.dn,
      };
    });

    return undefined;
  }
}
