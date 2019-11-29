/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import Ldap from 'ldapjs';
// #endregion
// #region Imports Local
import { LdapResponeUser } from '@app/ldap';
import { UserEntity } from '../user/user.entity';
import { GroupEntity } from './group.entity';
// #endregion

@Injectable()
export class GroupService {
  async createFromUser(ldap: LdapResponeUser, user?: UserEntity): Promise<GroupEntity[] | undefined> {
    ((ldap.groups as unknown) as Ldap.SearchEntryObject[]).forEach(async (group) => {
      // eslint-disable-next-line no-debugger
      debugger;
    });

    return undefined;
  }
}
