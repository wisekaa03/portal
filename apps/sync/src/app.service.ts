/** @format */

//#region Imports NPM
import { Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { LDAPUserProfile } from '@lib/types';
import { LdapService } from '@app/ldap';
import { UserService } from '@back/user/user.service';
import { ProfileService } from '@back/profile/profile.service';
//#endregion

@Injectable()
export class SyncService {
  constructor(
    @InjectPinoLogger(SyncService.name) private readonly logger: PinoLogger,
    private readonly ldapService: LdapService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  syncUser = async (): Promise<LDAPUserProfile[]> => {
    let errorCatch;

    try {
      const ldapUsers = await this.ldapService.synchronization();

      if (ldapUsers) {
        const promises = ldapUsers.map(async (ldapUser) => {
          if (ldapUser.sAMAccountName) {
            try {
              const user = await this.userService.fromLdap(ldapUser);

              return {
                id: user.id,
                loginIdentificator: user.loginIdentificator,
                name: user.username,
              };
            } catch (error) {
              this.logger.error(`LDAP: synchronization user="${ldapUser.sAMAccountName}"`, error.toString());

              throw new Error(`LDAP: synchronization user="${ldapUser.sAMAccountName}": ${error.toString()}`);
            }
          } else {
            try {
              const profile = await this.profileService.fromLdap(ldapUser);

              return {
                id: profile.id,
                loginIdentificator: profile.loginIdentificator,
                name: profile.username,
              };
            } catch (error) {
              this.logger.error(`LDAP: synchronization contact="${ldapUser.name}"`, error.toString());

              throw new Error(`LDAP: synchronization contact="${ldapUser.name}": ${error.toString()}`);
            }
          }
        });

        return Promise.allSettled(promises).then((values) =>
          values.reduce(
            (accumulator, promise) =>
              promise.status === 'fulfilled' && promise.value ? [...accumulator, promise.value] : accumulator,
            [] as LDAPUserProfile[],
          ),
        );
      }
    } catch (error) {
      errorCatch = error;
    }

    throw new Error(errorCatch);
  };

  synchronization = async (): Promise<boolean> => {
    this.logger.info('LDAP: Starting synchronization');

    const profilesLdap = await this.syncUser();

    const profilesDB = await this.profileService.allProfilesLdap();

    // const usersDB = await this.userService.allUsersLdap();
    // const intersectDB = profilesDB.reduce((accumulator, value) => {
    //   const element = usersDB.find((element) => element.loginIdentificator === value.loginIdentificator);
    //   return element ? [...accumulator, element] : [...accumulator, value];
    // }, [] as LDAPUserProfile[]);

    const promises = profilesDB.map(async (element) => {
      if (element.id && element.loginIdentificator) {
        const value = profilesLdap.find((value) => value.loginIdentificator === element.loginIdentificator);

        if (!value) {
          this.logger.info(`LDAP: Blocking profile: [id=${element.id}] ${element.name}`);
          await this.profileService.update(element.id, { disabled: true });
        }
      }
    });

    await Promise.allSettled(promises);

    this.logger.info('LDAP: success end of synchronization');
    return true;
  };
}
