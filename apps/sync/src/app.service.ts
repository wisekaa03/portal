/** @format */

//#region Imports NPM
import { Injectable, Inject, LoggerService, Logger, OnApplicationShutdown } from '@nestjs/common';
import { LdapService } from 'nestjs-ldap';
import type { LoggerContext } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { Contact, AllUsersInfo } from '@lib/types';
import { GroupService } from '@back/group/group.service';
import { UserService } from '@back/user/user.service';
import { ProfileService } from '@back/profile/profile.service';
//#endregion

interface LdapPromise {
  domain: string | null;
  contact: Contact;
  id: string;
  loginIdentificator: string | null;
  name: string | null;
  disabled?: boolean;
}

@Injectable()
export class SyncService implements OnApplicationShutdown {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly ldapService: LdapService,
    private readonly groupService: GroupService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  beforeApplicationShutdown(): void {
    this.logger.warn({
      message: 'Before Application Shutdown',
      context: SyncService.name,
      function: this.syncGroup.name,
    });
  }

  onApplicationShutdown(): void {
    this.logger.warn({
      message: 'Application Shutdown',
      context: SyncService.name,
      function: this.syncGroup.name,
    });
  }

  syncGroup = async ({ loggerContext }: { loggerContext?: LoggerContext }): Promise<void> => {
    const ldapGroups = await this.ldapService.synchronizationGroups({ loggerContext });

    const ldapGroupsDB = await this.groupService.allGroups();
    const groupPromises = ldapGroupsDB.map(async (element) => {
      if (element.id && element.loginIdentificator) {
        const ldapValue = Object.keys(ldapGroups).find((value) =>
          ldapGroups[value].find((domain) => /* value === element.domain && */ domain.objectGUID === element.loginIdentificator),
        );

        if (!ldapValue) {
          const affected = (await this.groupService.deleteLoginIdentificator(element.loginIdentificator))?.affected;
          this.logger.log({
            message: `Deleting group: [domain=${element.domain},id=${element.id}] ${element.name}: ${affected}`,
            context: SyncService.name,
            function: this.syncGroup.name,
            ...loggerContext,
          });
        }
      }
    });
    await Promise.allSettled(groupPromises);

    if (ldapGroups) {
      const promises = Object.keys(ldapGroups).reduce((accumulator, domainName) => {
        const domains = ldapGroups[domainName].map(async (ldapGroup) => {
          try {
            const group = await this.groupService.fromLdap(ldapGroup);

            return {
              domain: domainName,
              contact: Contact.GROUP,
              id: group.id,
              loginIdentificator: group.loginIdentificator,
              name: group.name,
            };
          } catch (error) {
            this.logger.error({
              message: `${domainName}: synchronization group "${ldapGroup.name}": ${error.toString()}`,
              error,
              context: SyncService.name,
              function: this.syncGroup.name,
              ...loggerContext,
            });

            throw new Error(`LDAP ${domainName}: synchronization group "${ldapGroup.name}": ${error.toString()}`);
          }
        });

        return accumulator.concat(domains);
      }, [] as Promise<LdapPromise>[]);

      await Promise.allSettled(promises);
    }
  };

  syncUser = async ({ loggerContext }: { loggerContext?: LoggerContext }): Promise<AllUsersInfo[]> => {
    const ldapUsers = await this.ldapService.synchronization({ loggerContext });

    if (ldapUsers) {
      const promises = Object.keys(ldapUsers).reduce((accumulator, domainName) => {
        const domain = ldapUsers[domainName].map(async (ldapUser) => {
          if (ldapUser.sAMAccountName) {
            try {
              const user = await this.userService.fromLdap({ domain: ldapUser.loginDomain || domainName, ldapUser, loggerContext });

              return {
                domain: domainName,
                contact: Contact.USER,
                id: user.id,
                loginIdentificator: user.loginIdentificator,
                name: user.username,
                disabled: user.disabled,
              };
            } catch (error) {
              this.logger.error({
                message: `${domainName}: synchronization user "${ldapUser.sAMAccountName}": ${error.toString()}`,
                error,
                context: SyncService.name,
                function: this.syncUser.name,
                ...loggerContext,
              });

              throw new Error(`${domainName}: synchronization user "${ldapUser.sAMAccountName}": ${error.toString()}`);
            }
          } else {
            try {
              const profile = await this.profileService.fromLdap({ domain: ldapUser.loginDomain || domainName, ldapUser, loggerContext });

              return {
                domain: domainName,
                contact: Contact.PROFILE,
                id: profile.id,
                loginIdentificator: profile.loginIdentificator,
                name: profile.username,
                disabled: profile.disabled,
              };
            } catch (error) {
              this.logger.error({
                message: `${domainName}: synchronization profile "${ldapUser.name}": ${error.toString()}`,
                error,
                context: SyncService.name,
                function: this.syncUser.name,
                ...loggerContext,
              });

              throw new Error(`${domainName}: synchronization profile "${ldapUser.name}": ${error.toString()}`);
            }
          }
        });

        return accumulator.concat(domain);
      }, [] as Promise<LdapPromise>[]);

      return Promise.allSettled(promises).then((values) =>
        values.reduce(
          (accumulator, promise) => (promise.status === 'fulfilled' && promise.value ? accumulator.concat(promise.value) : accumulator),
          [] as AllUsersInfo[],
        ),
      );
    }

    throw new Error('No users found');
  };

  synchronization = async ({ loggerContext }: { loggerContext?: LoggerContext }): Promise<boolean> => {
    this.logger.log({
      message: 'Synchronization groups',
      context: SyncService.name,
      function: this.synchronization.name,
      ...loggerContext,
    });
    await this.syncGroup({ loggerContext });

    this.logger.log({
      message: 'Synchronization profiles',
      context: SyncService.name,
      function: this.synchronization.name,
      ...loggerContext,
    });

    try {
      const profilesLdap = await this.syncUser({ loggerContext });

      this.logger.log({
        message: 'Blocking profiles',
        context: SyncService.name,
        function: this.synchronization.name,
        ...loggerContext,
      });
      const fromDB = [...(await this.userService.allUsers({})), ...(await this.profileService.allProfiles({ loggerContext }))];
      const profilesPromises = fromDB.map(async (element) => {
        if (element.id && element.loginIdentificator) {
          const value = profilesLdap.find((v) => v.domain === element.domain && v.loginIdentificator === element.loginIdentificator);

          if (element.contact === Contact.USER) {
            this.logger.log({
              message: `${!value ? 'Blocking user' : 'Granting user access'}: [domain=${element.domain}, id=${element.id}] ${element.name}`,
              context: SyncService.name,
              function: this.synchronization.name,
              ...loggerContext,
            });
            await this.userService.update({
              criteria: element.id,
              partialEntity: { loginDomain: element.domain, disabled: !value },
              loggerContext,
            });
          } else if (element.contact === Contact.PROFILE) {
            this.logger.log({
              message: `${!value ? 'Blocking profile' : 'Granting profile access'}: [domain=${element.domain}, id=${element.id}] ${
                element.name
              }`,
              context: SyncService.name,
              function: this.synchronization.name,
              ...loggerContext,
            });
            await this.profileService.update({
              criteria: element.id,
              partialEntity: { loginDomain: element.domain, disabled: !value },
              loggerContext,
            });
          }
        }
      });
      await Promise.allSettled(profilesPromises);
    } catch (error) {
      this.logger.error({
        message: error,
        context: SyncService.name,
        function: this.synchronization.name,
        ...loggerContext,
      });
    }

    this.logger.log({
      message: 'Success end of synchronization',
      context: SyncService.name,
      function: this.synchronization.name,
      ...loggerContext,
    });
    return true;
  };
}
