/** @format */

//#region Imports NPM
import { Injectable, Inject } from '@nestjs/common';
import { LdapService } from 'nestjs-ldap';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
//#endregion
//#region Imports Local
import { Contact, AllUsersInfo } from '@lib/types';
import { GroupService } from '@back/group/group.service';
import { UserService } from '@back/user/user.service';
import { ProfileService } from '@back/profile/profile.service';
import { LoggerContext } from '../../portal/src/shared/types/interfaces';
//#endregion

@Injectable()
export class SyncService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly ldapService: LdapService,
    private readonly groupService: GroupService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  syncGroup = async ({ loggerContext }: { loggerContext?: LoggerContext }): Promise<void> => {
    try {
      const ldapGroups = await this.ldapService.synchronizationGroups({ loggerContext });

      const ldapGroupsDB = await this.groupService.allGroups();
      const groupPromises = ldapGroupsDB.map(async (element) => {
        if (element.id && element.loginIdentificator) {
          const ldapValue = ldapGroups.find((value) => value.objectGUID === element.loginIdentificator);

          if (!ldapValue) {
            const affected = (await this.groupService.deleteLoginIdentificator(element.loginIdentificator))?.affected;
            this.logger.info(`LDAP: Deleting group: [id=${element.id}] ${element.name}: ${affected}`, {
              context: 'Synchronization',
              ...loggerContext,
            });
          }
        }
      });
      await Promise.allSettled(groupPromises);

      if (ldapGroups) {
        const promises = ldapGroups.map(async (ldapGroup) => {
          try {
            const group = await this.groupService.fromLdap(ldapGroup);

            return {
              contact: Contact.GROUP,
              id: group.id,
              loginIdentificator: group.loginIdentificator,
              name: group.name,
            };
          } catch (error) {
            this.logger.error(`LDAP: synchronization group "${ldapGroup.name}": ${error.toString()}`, {
              error,
              context: 'Synchronization',
              ...loggerContext,
            });

            throw new Error(`LDAP: synchronization group "${ldapGroup.name}": ${error.toString()}`);
          }
        });

        await Promise.allSettled(promises);
      }
    } catch (error) {
      throw new Error(error.toString());
    }
  };

  syncUser = async ({ loggerContext }: { loggerContext?: LoggerContext }): Promise<AllUsersInfo[]> => {
    try {
      const ldapUsers = await this.ldapService.synchronization({ loggerContext });

      if (ldapUsers) {
        const promises = ldapUsers.map(async (ldapUser) => {
          if (ldapUser.sAMAccountName) {
            try {
              const user = await this.userService.fromLdap({ ldapUser });

              return {
                contact: Contact.USER,
                id: user.id,
                loginIdentificator: user.loginIdentificator,
                name: user.username,
                disabled: user.disabled,
              };
            } catch (error) {
              this.logger.error(`LDAP: synchronization user "${ldapUser.sAMAccountName}": ${error.toString()}`, {
                error,
                context: 'Synchronization',
                ...loggerContext,
              });

              throw new Error(`LDAP: synchronization user "${ldapUser.sAMAccountName}": ${error.toString()}`);
            }
          } else {
            try {
              const profile = await this.profileService.fromLdap({ ldapUser, loggerContext });

              return {
                contact: Contact.PROFILE,
                id: profile.id,
                loginIdentificator: profile.loginIdentificator,
                name: profile.username,
                disabled: profile.disabled,
              };
            } catch (error) {
              this.logger.error(`LDAP: synchronization profile "${ldapUser.name}": ${error.toString()}`, {
                error,
                context: 'Synchronization',
                ...loggerContext,
              });

              throw new Error(`LDAP: synchronization profile "${ldapUser.name}": ${error.toString()}`);
            }
          }
        });

        return Promise.allSettled(promises).then((values) =>
          values.reduce(
            (accumulator, promise) => (promise.status === 'fulfilled' && promise.value ? [...accumulator, promise.value] : accumulator),
            [] as AllUsersInfo[],
          ),
        );
      }

      throw new Error('No users found');
    } catch (error) {
      throw new Error(error.toString());
    }
  };

  synchronization = async ({ loggerContext }: { loggerContext?: LoggerContext }): Promise<boolean> => {
    this.logger.info('LDAP: Synchronization groups', { context: 'Synchronization', ...loggerContext });
    await this.syncGroup({ loggerContext });

    this.logger.info('LDAP: Synchronization profiles', { context: 'Synchronization', ...loggerContext });
    const profilesLdap = await this.syncUser({ loggerContext });

    this.logger.info('LDAP: Blocking profiles', { context: 'Synchronization', ...loggerContext });
    const fromDB = [...(await this.userService.allUsers({})), ...(await this.profileService.allProfiles({ loggerContext }))];
    const profilesPromises = fromDB.map(async (element) => {
      if (element.id && element.loginIdentificator) {
        const value = profilesLdap.find((v) => v.loginIdentificator === element.loginIdentificator);

        if (element.contact === Contact.USER) {
          this.logger.info(`LDAP: ${!value ? 'Blocking user' : 'Granting user access'}: [id=${element.id}] ${element.name}`, {
            context: 'Synchronization',
            ...loggerContext,
          });
          await this.userService.update({ criteria: element.id, partialEntity: { disabled: !value }, loggerContext });
        } else if (element.contact === Contact.PROFILE) {
          this.logger.info(`LDAP: ${!value ? 'Blocking profile' : 'Granting profile access'}: [id=${element.id}] ${element.name}`, {
            context: 'Synchronization',
            ...loggerContext,
          });
          await this.profileService.update({ criteria: element.id, partialEntity: { disabled: !value }, loggerContext });
        }
      }
    });
    await Promise.allSettled(profilesPromises);

    this.logger.info('LDAP: success end of synchronization', { context: 'Synchronization', ...loggerContext });
    return true;
  };
}
