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

  /**
   * Create or Update user groups
   *
   * @param {LdapResponseUser} ldapUser The LDAP user
   * @param {boolean} [cache = true] Cache the result
   * @returns {Promise<GroupEntity[]>} The group entity
   * @throws {Error} Exception
   */
  async createFromUser(ldap: LdapResponseUser, cache = true): Promise<GroupEntity[]> {
    const groups: GroupEntity[] = [];

    if (ldap.groups) {
      // eslint-disable-next-line no-restricted-syntax
      for (const ldapGroup of ldap.groups as LdapResonseGroup[]) {
        // eslint-disable-next-line no-await-in-loop
        const updateId = await this.groupByIdentificator(ldapGroup.objectGUID, cache);

        const group: Group = {
          ...updateId,
          loginService: LoginService.LDAP,
          loginIdentificator: ldapGroup.objectGUID,
          name: ldapGroup.sAMAccountName,
          dn: ldapGroup.dn,
        };

        groups.push(this.groupRepository.create(group));
      }

      await this.bulkSave(groups);
    }

    return groups;
  }

  /**
   * Group by Identificator
   *
   * @param {string} loginIdentificator Group object GUID
   * @param {boolean} [cache = true] Cache true/false
   * @return {Promise<GroupEntity | undefined>} Group
   */
  groupByIdentificator = async (loginIdentificator: string, cache = true): Promise<GroupEntity | undefined> =>
    this.groupRepository.findOne({ where: { loginIdentificator }, cache });

  /**
   * Create
   *
   * @param {Group} group The group object
   * @returns {GroupEntity} The group entity after create
   */
  create = (group: Group): GroupEntity => this.groupRepository.create(group);

  /**
   * Bulk Save
   *
   * @param {GroupEntity[]} group The groups entity
   * @returns {Promise<GroupEntity[]>} The groups after save
   */
  bulkSave = async (group: GroupEntity[]): Promise<GroupEntity[]> =>
    this.groupRepository.save(group).catch((error) => {
      this.logService.error('Unable to save data in `groups`', error, 'GroupService');

      throw error;
    });

  /**
   * Save the group
   *
   * @param {GroupEntity} group The group entity
   * @returns {Promise<GroupEntity>} The group after save
   */
  save = async (group: GroupEntity): Promise<GroupEntity> =>
    this.groupRepository.save(group).catch((error) => {
      this.logService.error('Unable to save data in `group`', error, 'GroupService');

      throw error;
    });
}
