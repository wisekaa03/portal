/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapResponeUser, LdapResonseGroup } from '@app/ldap';
import { UserEntity } from '../user/user.entity';
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

  async createFromUser(ldap: LdapResponeUser, user?: UserEntity): Promise<GroupEntity[] | undefined> {
    const groups: GroupEntity[] = [];

    if (ldap.groups) {
      await (ldap.groups as LdapResonseGroup[]).forEach(async (ldapGroup) => {
        const group: Group = {
          name: ldapGroup.sAMAccountName as string,
          dn: ldapGroup.dn,
          loginService: LoginService.LDAP,
          loginIdentificator: ldapGroup.objectGUID,
        };

        if (user) {
          const gb = await this.groupRepository.findOne({ loginIdentificator: ldapGroup.objectGUID });
          if (gb) {
            group.id = gb.id;
          }
        }

        let gb;
        let g;
        try {
          gb = this.groupRepository.create(group);
        } catch (error) {
          this.logService.error('Group create error:', error, 'GroupService');

          throw error;
        }

        try {
          g = await this.groupRepository.save(gb);
        } catch (error) {
          this.logService.error('Unable to save data in `group`', error, 'GroupService');

          throw error;
        }

        if (g) {
          groups.push(g);
        }
      });
    }

    return groups;
  }
}
