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
        const updateAt = await this.groupByIdentificator(ldapGroup.objectGUID);

        const group: Group = {
          ...updateAt,
          loginIdentificator: ldapGroup.objectGUID,
          name: ldapGroup.sAMAccountName as string,
          dn: ldapGroup.dn,
          loginService: LoginService.LDAP,
        };

        return this.create(group);
      });

      groups = await Promise.all(promises);
      await this.save(groups);
    }

    return groups;
  }

  /**
   * Group by Identificator
   *
   * @param loginIdentificator string
   * @return Group
   */
  groupByIdentificator = async (loginIdentificator: string): Promise<GroupEntity | undefined> =>
    this.groupRepository.findOne({ where: { loginIdentificator }, cache: true });

  /**
   * Create
   *
   * @param {Group} The group
   * @returns {GroupEntity} The group entity
   */
  create = (group: Group): GroupEntity => {
    try {
      return this.groupRepository.create(group);
    } catch (error) {
      this.logService.error('Unable to create data in `group`', error, 'GroupService');

      throw error;
    }
  };

  /**
   * Save
   *
   * @param {GroupEntity[]} The groups
   * @returns {GroupEntity[] | undefined} The groups
   */
  save = async (group: GroupEntity[]): Promise<GroupEntity[] | undefined> => {
    try {
      return this.groupRepository.save(group);
    } catch (error) {
      this.logService.error('Unable to save data in `group`', error.toString(), 'GroupService');

      throw error;
    }
  };
}
