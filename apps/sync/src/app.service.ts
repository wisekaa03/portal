/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapService } from '@app/ldap';
import { UserService } from '@back/user/user.service';
import { ProfileService } from '@back/profile/profile.service';
// #endregion

@Injectable()
export class SyncService {
  constructor(
    private readonly logger: LogService,
    private readonly ldapService: LdapService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {
    logger.setContext(SyncService.name);
  }

  synchronization = async (): Promise<boolean> => {
    // TODO: profiles that not in AD but in DB

    const ldapUsers = await this.ldapService.synchronization();

    if (ldapUsers) {
      ldapUsers.forEach(async (ldapUser) => {
        if (ldapUser.sAMAccountName) {
          try {
            await this.userService.fromLdap(ldapUser);
          } catch (error) {
            this.logger.error(`Error with "${ldapUser.sAMAccountName}"`, error);
          }
        } else {
          await this.profileService.fromLdap(ldapUser);
        }
      });

      this.logger.log('--- End of synchronization: true ---');
      return true;
    }

    this.logger.log('--- End of synchronization: false ---');
    return false;
  };
}
