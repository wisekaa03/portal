/** @format */

//#region Imports NPM
import { Injectable, Inject, InternalServerErrorException, Logger, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { LdapResponseGroup, LdapResponseUser, LoggerContext, LdapResponseObject } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { AllUsersInfo } from '@lib/types';
import { LoginService, Contact } from '@back/shared/graphql';
import { ConfigService } from '@app/config';
import { Group } from './group.entity';
//#endregion

@Injectable()
export class GroupService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(Logger) private readonly logger: LoggerService,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  /**
   * All groups in Synchronization
   */
  allGroups = async ({
    loginService = LoginService.LDAP,
    cache = true,
    transaction = false,
  }: {
    loginService?: LoginService;
    cache?: boolean;
    transaction?: boolean;
  }): Promise<AllUsersInfo[]> =>
    this.groupRepository
      .find({
        where: { loginService },
        select: ['id', 'loginDomain', 'loginGUID', 'name'],
        loadEagerRelations: false,
        cache,
        transaction,
      })
      .then((groups) =>
        groups.map((group) => ({
          contact: Contact.GROUP,
          id: group.id,
          loginDomain: group.loginDomain,
          loginGUID: group.loginGUID,
          name: group.name,
        })),
      );

  /**
   * Group by Identificator
   *
   * @async
   * @method byLoginGUID
   * @param {string} loginGUID LDAP: Group object GUID
   * @param {boolean} [cache = true] Cache true/false
   * @return {Promise<Group | undefined>} Group
   */
  byLoginGUID = async ({
    loginGUID,
    loginDomain,
    cache = true,
    transaction = false,
  }: {
    loginGUID: string;
    loginDomain: string;
    cache?: boolean;
    transaction?: boolean;
  }): Promise<Group | undefined> =>
    this.groupRepository.findOne({
      where: { loginService: LoginService.LDAP, loginDomain, loginGUID },
      // @todo:
      cache,
      transaction,
    });

  /**
   * Create or Update user groups
   *
   * @async
   * @param {LdapResponseUser} ldapUser The LDAP user
   * @returns {Group[]} The group entity
   * @throws {Error} Exception
   */
  async fromLdapUser({
    ldapUser,
    loggerContext,
    transaction = true,
  }: {
    ldapUser: LdapResponseUser;
    transaction?: boolean;
    loggerContext?: LoggerContext;
  }): Promise<Group[]> {
    const groupsPromises = ldapUser.groups?.map(async (ldapGroup: LdapResponseGroup) =>
      this.byLoginGUID({ loginGUID: ldapGroup.objectGUID, loginDomain: ldapGroup.loginDomain }).then((updated) => {
        const group: Group = {
          ...updated,
          loginService: LoginService.LDAP,
          loginDomain: ldapGroup.loginDomain,
          loginGUID: ldapGroup.objectGUID,
          loginDN: ldapGroup.dn,
          name: ldapGroup.sAMAccountName || ldapGroup.displayName || ldapGroup.name || ldapGroup.cn,
          description: ldapGroup.description,
        };

        return this.groupRepository.save(this.groupRepository.create(group), { transaction });
      }),
    );

    return groupsPromises
      ? Promise.allSettled(groupsPromises).then((values) =>
          values.reduce((accumulator: Group[], current: PromiseSettledResult<Group>) => {
            if (current.status === 'fulfilled') {
              return accumulator.concat(current.value);
            }
            this.logger.error({
              message: `Groups error: ${current.reason}`,
              error: current.reason,
              context: GroupService.name,
              function: 'fromLdapUser',
            });

            return accumulator;
          }, [] as Group[]),
        )
      : [];
  }

  /**
   * Create or Update group
   *
   * @async
   * @param {LdapResponseGroup} ldapGroup The LDAP user
   * @returns {Group} The group entity
   * @throws {Error} Exception
   */
  async fromLdap({ ldap, transaction = true }: { ldap: LdapResponseGroup; transaction?: boolean }): Promise<Group> {
    const loginGUID = await this.byLoginGUID({ loginGUID: ldap.objectGUID, loginDomain: ldap.loginDomain });
    const group: Group = {
      ...loginGUID,
      loginService: LoginService.LDAP,
      loginDomain: ldap.loginDomain,
      loginGUID: ldap.objectGUID,
      loginDN: ldap.dn,
      name: ldap.sAMAccountName || ldap.displayName || ldap.name || ldap.cn,
      description: ldap.description,
    };

    return this.groupRepository.save(this.groupRepository.create(group), { transaction });
  }

  /**
   * Create
   *
   * @param {Group} group The group object
   * @returns {Group} The group entity after create
   */
  create = (group: Group): Group => this.groupRepository.create(group);

  /**
   * Bulk Save
   *
   * @async
   * @param {Group[]} group The groups entity
   * @returns {Group[]} The groups after save
   */
  bulkSave = async (group: Group[]): Promise<Group[]> =>
    this.groupRepository.save(group).catch((error) => {
      this.logger.error({
        message: `Unable to save data in "group": ${error.toString()}`,
        error,
        context: GroupService.name,
        function: 'bulkSave',
      });

      throw new InternalServerErrorException(__DEV__ ? error : undefined);
    });

  /**
   * Save the group
   *
   * @async
   * @param {Group} group The group entity
   * @returns {Group} The group after save
   */
  save = async ({ group, transaction = true }: { group: Group; transaction?: boolean }): Promise<Group> =>
    this.groupRepository.save(group, { transaction }).catch((error) => {
      this.logger.error({
        message: `Unable to save data in "group": ${error.toString()}`,
        error,
        context: GroupService.name,
        function: 'save',
      });

      throw new InternalServerErrorException(__DEV__ ? error : undefined);
    });

  /**
   * Delete a group
   *
   * @async
   */
  deleteLoginGUID = async (loginGUID: string): Promise<DeleteResult> => this.groupRepository.delete({ loginGUID });
}
