/** @format */

//#region Imports NPM
import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LdapResponseGroup, LdapResponseUser } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { LoginService, Group, Contact, AllUsersInfo } from '@lib/types';
import { ConfigService } from '@app/config';
import { GroupEntity } from './group.entity';
//#endregion

@Injectable()
export class GroupService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  /**
   * All groups in Synchronization
   */
  allGroups = async (loginService = LoginService.LDAP, cache = true): Promise<AllUsersInfo[]> =>
    this.groupRepository
      .find({
        where: { loginService },
        select: ['id', 'loginDomain', 'loginIdentificator', 'name'],
        loadEagerRelations: false,
        cache,
      })
      .then((groups) =>
        groups.map((group) => ({
          contact: Contact.GROUP,
          id: group.id,
          domain: group.loginDomain,
          loginIdentificator: group.loginIdentificator,
          name: group.name,
        })),
      );

  /**
   * Group by Identificator
   *
   * @async
   * @method byIdentificator
   * @param {string} loginIdentificator Group object GUID
   * @param {boolean} [cache = true] Cache true/false
   * @return {Promise<GroupEntity | undefined>} Group
   */
  byIdentificator = async (loginIdentificator: string, cache = true): Promise<GroupEntity | undefined> =>
    this.groupRepository.findOne({
      where: { loginIdentificator },
      // TODO:
      cache,
    });

  /**
   * Create or Update user groups
   *
   * @async
   * @param {LdapResponseUser} ldapUser The LDAP user
   * @returns {GroupEntity[]} The group entity
   * @throws {Error} Exception
   */
  async fromLdapUser(ldap: LdapResponseUser): Promise<GroupEntity[]> {
    const groupsPromises = ldap.groups?.map(
      async (ldapGroup: LdapResponseGroup) =>
        // eslint-disable-next-line no-return-await
        await this.byIdentificator(ldapGroup.objectGUID).then((updated) => {
          const group: Group = {
            ...updated,
            loginService: LoginService.LDAP,
            loginDomain: ldapGroup.loginDomain,
            loginIdentificator: ldapGroup.objectGUID,
            name: ldapGroup.name,
            description: ldapGroup.description,
            dn: ldapGroup.dn,
          };

          return this.groupRepository.save(this.groupRepository.create(group));
        }),
    );

    return groupsPromises
      ? Promise.allSettled(groupsPromises).then((values) =>
          values.reduce((accumulator: GroupEntity[], current: PromiseSettledResult<GroupEntity>) => {
            if (current.status === 'fulfilled') {
              return accumulator.concat(current.value);
            }
            this.logger.error(`Groups error: ${current.reason}`, {
              error: current.reason,
              context: GroupService.name,
              function: 'fromLdapUser',
            });

            return accumulator;
          }, [] as GroupEntity[]),
        )
      : [];
  }

  /**
   * Create or Update group
   *
   * @async
   * @param {LdapResponseGroup} ldapGroup The LDAP user
   * @returns {GroupEntity} The group entity
   * @throws {Error} Exception
   */
  async fromLdap(ldap: LdapResponseGroup): Promise<GroupEntity> {
    const loginIdentificator = await this.byIdentificator(ldap.objectGUID);
    const group: Group = {
      ...loginIdentificator,
      loginService: LoginService.LDAP,
      loginDomain: ldap.loginDomain,
      loginIdentificator: ldap.objectGUID,
      name: ldap.sAMAccountName,
      description: ldap.description,
      dn: ldap.dn,
    };

    return this.groupRepository.save(this.groupRepository.create(group));
  }

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
   * @async
   * @param {GroupEntity[]} group The groups entity
   * @returns {GroupEntity[]} The groups after save
   */
  bulkSave = async (group: GroupEntity[]): Promise<GroupEntity[]> =>
    this.groupRepository.save(group).catch((error) => {
      this.logger.error(`Unable to save data in "group": ${error.toString()}`, { error, context: GroupService.name, function: 'bulkSave' });

      throw new InternalServerErrorException(__DEV__ ? error : undefined);
    });

  /**
   * Save the group
   *
   * @async
   * @param {GroupEntity} group The group entity
   * @returns {GroupEntity} The group after save
   */
  save = async (group: GroupEntity): Promise<GroupEntity> =>
    this.groupRepository.save(group).catch((error) => {
      this.logger.error(`Unable to save data in "group": ${error.toString()}`, { error, context: GroupService.name, function: 'save' });

      throw new InternalServerErrorException(__DEV__ ? error : undefined);
    });

  /**
   * Delete a group
   *
   * @async
   */
  deleteLoginIdentificator = async (loginIdentificator: string): Promise<DeleteResult> =>
    this.groupRepository.delete({ loginIdentificator });
}
