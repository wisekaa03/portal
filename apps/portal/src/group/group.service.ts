/** @format */

//#region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { LoginService, Group, Contact, AllUsersInfo } from '@lib/types';
import { ConfigService } from '@app/config';
import { LdapService, LdapResponseGroup, LdapResponseUser } from '@app/ldap';
import { GroupEntity } from './group.entity';
//#endregion

@Injectable()
export class GroupService {
  dbCacheTtl = 10000;

  constructor(
    private readonly configService: ConfigService,
    private readonly ldapService: LdapService,
    @InjectPinoLogger(GroupService.name) private readonly logger: PinoLogger,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {
    this.dbCacheTtl = this.configService.get<number>('DATABASE_REDIS_TTL');
  }

  /**
   * All groups in Synchronization
   */
  allGroups = async (loginService = LoginService.LDAP): Promise<AllUsersInfo[]> => {
    return (
      this.groupRepository
        // eslint-disable-next-line unicorn/no-fn-reference-in-iterator
        .find({
          where: { loginService },
          select: ['id', 'loginIdentificator', 'name'],
          loadEagerRelations: false,
          cache: false,
        })
        .then((groups) =>
          groups.map((group) => ({
            contact: Contact.GROUP,
            id: group.id,
            loginIdentificator: group.loginIdentificator,
            name: group.name,
          })),
        )
    );
  };

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
    this.groupRepository
      .findOne({
        where: { loginIdentificator },
        cache: cache ? { id: `group_LI_${loginIdentificator}`, milliseconds: this.dbCacheTtl } : false,
      })
      .catch((error: Error) => {
        throw error;
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
    const groupsPromises = ldap.groups.map(
      async (ldapGroup: LdapResponseGroup) =>
        await this.byIdentificator(ldapGroup.objectGUID).then((updated) => {
          const group: Group = {
            ...updated,
            loginService: LoginService.LDAP,
            loginIdentificator: ldapGroup.objectGUID,
            name: ldapGroup.name,
            description: ldapGroup.description,
            dn: ldapGroup.dn,
          };

          return this.groupRepository.save(this.groupRepository.create(group));
        }),
    );

    return Promise.allSettled(groupsPromises).then((values) =>
      values.reduce((accumulator: GroupEntity[], current: PromiseSettledResult<GroupEntity>) => {
        if (current.status === 'fulfilled') {
          return accumulator.concat(current.value);
        }
        this.logger.error(`Groups error: ${current.reason}`, [{ error: current.reason }]);

        return accumulator;
      }, [] as GroupEntity[]),
    );
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
      const message = error.toString();
      this.logger.error(`Unable to save data in "group": ${message}`, message);

      throw error;
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
      const message = error.toString();
      this.logger.error(`Unable to save data in "group": ${message}`, message);

      throw error;
    });

  /**
   * Delete a group
   *
   * @async
   */
  deleteLoginIdentificator = async (loginIdentificator: string): Promise<DeleteResult> =>
    this.groupRepository.delete({ loginIdentificator });
}
