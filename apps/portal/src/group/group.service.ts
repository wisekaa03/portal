/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LdapResponeUser } from '@app/ldap';
import { UserEntity } from '../user/user.entity';
import { GroupEntity } from './group.entity';
// #endregion

@Injectable()
export class GroupService {
  async createFromUser(ldap: LdapResponeUser, user?: UserEntity): Promise<GroupEntity[] | undefined> {
    return undefined;
  }
}
