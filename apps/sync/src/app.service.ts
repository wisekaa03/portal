/** @format */

//#region Imports NPM
import { Injectable, Inject, LoggerService, Logger, OnApplicationShutdown } from '@nestjs/common';
import { LdapService } from 'nestjs-ldap';
import type { LoggerContext } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { AllUsersInfo } from '@lib/types';
import { Contact } from '@back/shared/graphql';
import { GroupService } from '@back/group/group.service';
import { UserService } from '@back/user/user.service';
import { ProfileService } from '@back/profile/profile.service';
//#endregion

interface LdapPromise {
  loginDomain?: string;
  loginGUID?: string;
  contact: Contact;
  id?: string;
  name?: string;
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
      function: 'beforeApplicationShutdown',
    });
  }

  onApplicationShutdown(): void {
    this.logger.warn({
      message: 'Application Shutdown',
      context: SyncService.name,
      function: 'onApplicationShutdown',
    });
  }

  isNormal = <T>(domains: Record<string, Error | T>): domains is Record<string, T> =>
    !Object.keys(domains).some((domain) => domains[domain] instanceof Error);

  syncGroup = async ({ loggerContext }: { loggerContext?: LoggerContext }): Promise<void> => {
    this.logger.log({
      message: 'Synchronization groups',
      context: SyncService.name,
      function: 'syncGroup',
      ...loggerContext,
    });

    const ldapGroups = await this.ldapService.synchronizationGroups({ loggerContext });
    if (this.isNormal(ldapGroups)) {
      const ldapGroupsDB = await this.groupService.allGroups({});
      const groupPromises = ldapGroupsDB.map(async (element) => {
        if (element.id && element.loginGUID) {
          const ldapValue = Object.keys(ldapGroups).find((value) =>
            ldapGroups[value].find((domain) => /* value === element.domain && */ domain.objectGUID === element.loginGUID),
          );

          if (!ldapValue) {
            const affected = (await this.groupService.deleteLoginGUID(element.loginGUID))?.affected;
            this.logger.log({
              message: `Deleting group: [domain=${element.loginDomain},id=${element.id}] ${element.name}: ${affected}`,
              context: SyncService.name,
              function: 'syncGroup',
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
              const group = await this.groupService.fromLdap({ ldap: ldapGroup, transaction: false });

              return {
                loginDomain: domainName,
                loginGUID: group.loginGUID,
                contact: Contact.GROUP,
                id: group.id,
                name: group.name,
              };
            } catch (error) {
              this.logger.error({
                message: `${domainName}: synchronization group "${ldapGroup.name}": ${error.toString()}`,
                error,
                context: SyncService.name,
                function: 'syncGroup',
                ...loggerContext,
              });

              throw new Error(`LDAP ${domainName}: synchronization group "${ldapGroup.name}": ${error.toString()}`);
            }
          });

          return accumulator.concat(domains);
        }, [] as Promise<LdapPromise>[]);

        await Promise.allSettled(promises);
      }
    } else {
      const ldapRejects = Object.keys(ldapGroups).filter((domain) => ldapGroups[domain] instanceof Error);
      ldapRejects.forEach((error) =>
        this.logger.error({
          message: `Group error: ${ldapGroups[error]}`,
          context: SyncService.name,
          function: 'syncGroup',
          ...loggerContext,
        }),
      );
    }
  };

  syncUser = async ({ loggerContext }: { loggerContext?: LoggerContext }): Promise<AllUsersInfo[]> => {
    this.logger.log({
      message: 'Synchronization profiles',
      context: SyncService.name,
      function: 'syncUser',
      ...loggerContext,
    });

    const ldapUsers = await this.ldapService.synchronization({ loggerContext });

    if (this.isNormal(ldapUsers)) {
      const ldapUsersCount = Object.keys(ldapUsers).reduce((accumulator, domainName) => accumulator + ldapUsers[domainName].length, 0);

      this.logger.log({
        message: `Users and profiles from LDAP: ${ldapUsersCount}`,
        context: SyncService.name,
        function: 'syncUser',
        ...loggerContext,
      });

      const promises = Object.keys(ldapUsers).reduce((accumulator, domainName) => {
        const domain = ldapUsers[domainName].map(async (ldapUser) => {
          if (ldapUser.objectClass.includes('user')) {
            try {
              const user = await this.userService.fromLdap({
                domain: ldapUser.loginDomain || domainName,
                ldapUser,
                transaction: false,
                loggerContext,
              });

              return {
                loginDomain: domainName,
                loginGUID: user.loginGUID,
                contact: Contact.USER,
                id: user.id,
                name: user.username,
                disabled: user.disabled,
              };
            } catch (error) {
              this.logger.error({
                message: `${domainName}: synchronization user "${ldapUser.sAMAccountName}": ${error.toString()}`,
                error,
                context: SyncService.name,
                function: 'syncUser',
                ...loggerContext,
              });

              throw new Error(`${domainName}: synchronization user "${ldapUser.sAMAccountName}": ${error.toString()}`);
            }
          } else {
            try {
              const profile = await this.profileService.fromLdap({
                domain: ldapUser.loginDomain || domainName,
                ldapUser,
                transaction: false,
                loggerContext,
              });

              return {
                loginDomain: domainName,
                loginGUID: profile.loginGUID,
                contact: Contact.PROFILE,
                id: profile.id,
                name: profile.username,
                disabled: profile.disabled,
              };
            } catch (error) {
              this.logger.error({
                message: `${domainName}: synchronization profile "${ldapUser.name}": ${error.toString()}`,
                error,
                context: SyncService.name,
                function: 'syncUser',
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

    const ldapRejects = Object.keys(ldapUsers).filter((domain) => ldapUsers[domain] instanceof Error);
    ldapRejects.forEach((error) =>
      this.logger.error({
        message: `User error: ${ldapUsers[error]}`,
        context: SyncService.name,
        function: 'syncGroup',
        ...loggerContext,
      }),
    );

    throw new Error('No users found');
  };

  synchronization = async ({ loggerContext }: { loggerContext?: LoggerContext }): Promise<boolean> => {
    try {
      await this.syncGroup({ loggerContext });

      this.logger.log({
        message: 'Groups synchronized',
        context: SyncService.name,
        function: 'synchronization',
        ...loggerContext,
      });
    } catch (error) {
      return false;
    }

    try {
      const profilesLdap = await this.syncUser({ loggerContext });

      this.logger.log({
        message: 'Blocking profiles',
        context: SyncService.name,
        function: 'synchronization',
        ...loggerContext,
      });
      const dbProfiles = await this.profileService.allProfiles({ loggerContext });
      const profilesPromises = dbProfiles.map(async (element) => {
        if (element.id && element.loginGUID) {
          const disabled = !profilesLdap.find((v) => v.loginDomain === element.loginDomain && v.loginGUID === element.loginGUID);

          this.logger.log({
            message: `${disabled ? 'Blocking profile' : 'Granting profile access'}: [domain=${element.loginDomain}, id=${element.id}] ${
              element.name
            }`,
            context: SyncService.name,
            function: 'synchronization',
            ...loggerContext,
          });

          await this.profileService.update({
            criteria: element.id,
            partialEntity: { loginDomain: element.loginDomain, disabled },
            loggerContext,
          });
        } else {
          this.logger.warn({
            message: `Profile has not an 'id'? [domain=${element.loginDomain}, id=${element.id}] ${element.name}`,
            context: SyncService.name,
            function: 'synchronization',
            ...loggerContext,
          });
        }
      });

      const dbUsers = await this.userService.allUsers({ loggerContext });
      const usersPromises = dbUsers.map(async (element) => {
        if (element.id && element.loginGUID) {
          const disabled = !profilesLdap.find((v) => v.loginDomain === element.loginDomain && v.loginGUID === element.loginGUID);

          this.logger.log({
            message: `${disabled ? 'Blocking user' : 'Granting user access'}: [domain=${element.loginDomain}, id=${element.id}] ${
              element.name
            }`,
            context: SyncService.name,
            function: 'synchronization',
            ...loggerContext,
          });

          await this.userService.update({
            criteria: element.id,
            partialEntity: { loginDomain: element.loginDomain, disabled },
            loggerContext,
          });
        } else {
          this.logger.warn({
            message: `User has not an 'id'? [domain=${element.loginDomain}, id=${element.id}] ${element.name}`,
            context: SyncService.name,
            function: 'synchronization',
            ...loggerContext,
          });
        }
      });

      await Promise.allSettled([profilesPromises, usersPromises]);
    } catch (error) {
      return false;
    }

    this.logger.log({
      message: 'Success end of synchronization',
      context: SyncService.name,
      function: 'synchronization',
      ...loggerContext,
    });

    return true;
  };
}
