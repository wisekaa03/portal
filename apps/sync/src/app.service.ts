/** @format */

//#region Imports NPM
import { Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { LdapService } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { Contact, AllUsersInfo } from '@lib/types';
import { GroupService } from '@back/group/group.service';
import { UserService } from '@back/user/user.service';
import { ProfileService } from '@back/profile/profile.service';
//#endregion

@Injectable()
export class SyncService {
  constructor(
    @InjectPinoLogger(SyncService.name) private readonly logger: PinoLogger,
    private readonly ldapService: LdapService,
    private readonly groupService: GroupService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  syncGroup = async (): Promise<void> => {
    try {
      const ldapGroups = await this.ldapService.synchronizationGroups();

      const ldapGroupsDB = await this.groupService.allGroups();
      const groupPromises = ldapGroupsDB.map(async (element) => {
        if (element.id && element.loginIdentificator) {
          const ldapValue = ldapGroups.find((value) => value.objectGUID === element.loginIdentificator);

          if (!ldapValue) {
            const affected = (await this.groupService.deleteLoginIdentificator(element.loginIdentificator))?.affected;
            this.logger.info(`LDAP: Deleting group: [id=${element.id}] ${element.name}: ${affected}`);
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
            const message = error.toString();
            this.logger.error(`LDAP: synchronization group "${ldapGroup.name}": ${message}`, message);

            throw new Error(`LDAP: synchronization group "${ldapGroup.name}": ${message}`);
          }
        });

        await Promise.allSettled(promises);
      }
    } catch (error) {
      throw new Error(error.toString());
    }
  };

  syncUser = async (): Promise<AllUsersInfo[]> => {
    try {
      const ldapUsers = await this.ldapService.synchronization();

      if (ldapUsers) {
        const promises = ldapUsers.map(async (ldapUser) => {
          if (ldapUser.sAMAccountName) {
            try {
              const user = await this.userService.fromLdap(ldapUser);

              return {
                contact: Contact.USER,
                id: user.id,
                loginIdentificator: user.loginIdentificator,
                name: user.username,
                disabled: user.disabled,
              };
            } catch (error) {
              const message = error.toString();
              this.logger.error(`LDAP: synchronization user "${ldapUser.sAMAccountName}": ${message}`, message);

              throw new Error(`LDAP: synchronization user "${ldapUser.sAMAccountName}": ${message}`);
            }
          } else {
            try {
              const profile = await this.profileService.fromLdap(ldapUser);

              return {
                contact: Contact.PROFILE,
                id: profile.id,
                loginIdentificator: profile.loginIdentificator,
                name: profile.username,
                disabled: profile.disabled,
              };
            } catch (error) {
              const message = error.toString();
              this.logger.error(`LDAP: synchronization profile "${ldapUser.name}": ${message}`, message);

              throw new Error(`LDAP: synchronization profile "${ldapUser.name}": ${message}`);
            }
          }
        });

        return Promise.allSettled(promises).then((values) =>
          values.reduce(
            (accumulator, promise) =>
              promise.status === 'fulfilled' && promise.value ? [...accumulator, promise.value] : accumulator,
            [] as AllUsersInfo[],
          ),
        );
      }

      throw new Error('No users found');
    } catch (error) {
      throw new Error(error.toString());
    }
  };

  synchronization = async (): Promise<boolean> => {
    this.logger.info('LDAP: Synchronization groups');
    await this.syncGroup();

    this.logger.info('LDAP: Synchronization profiles');
    const profilesLdap = await this.syncUser();

    this.logger.info('LDAP: Blocking profiles');
    const fromDB = [...(await this.userService.allUsers()), ...(await this.profileService.allProfiles())];
    const profilesPromises = fromDB.map(async (element) => {
      if (element.id && element.loginIdentificator) {
        const value = profilesLdap.find((value) => value.loginIdentificator === element.loginIdentificator);

        if (element.contact === Contact.USER) {
          this.logger.info(
            `LDAP: ${!value ? 'Blocking user' : 'Granting user access'}: [id=${element.id}] ${element.name}`,
          );
          await this.userService.update(element.id, { disabled: !value });
        } else if (element.contact === Contact.PROFILE) {
          this.logger.info(
            `LDAP: ${!value ? 'Blocking profile' : 'Granting profile access'}: [id=${element.id}] ${element.name}`,
          );
          await this.profileService.update(element.id, { disabled: !value });
        }
      }
    });
    await Promise.allSettled(profilesPromises);

    this.logger.info('LDAP: success end of synchronization');
    return true;
  };
}
