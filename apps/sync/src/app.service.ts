/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { Logger } from '@app/logger';
import { LdapService } from '@app/ldap';
import { UserService } from '@back/user/user.service';
import { ProfileService } from '@back/profile/profile.service';
// #endregion

@Injectable()
export class SyncService {
  constructor(
    private readonly logService: Logger,
    private readonly ldapService: LdapService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  synchronization = async (): Promise<boolean> => {
    // TODO: profiles that not in AD but in DB

    const ldapUsers = await this.ldapService.synchronization();

    if (ldapUsers) {
      ldapUsers.forEach(async (ldapUser) => {
        if (ldapUser.sAMAccountName) {
          try {
            await this.userService.fromLdap(ldapUser);
          } catch (error) {
            this.logService.error(
              `Error with "${ldapUser.sAMAccountName}"`,
              error,
              `${SyncService.name}:synchronization`,
            );
          }
        } else {
          await this.profileService.fromLdap(ldapUser);
        }
      });

      this.logService.log('--- End of synchronization: true ---', `${SyncService.name}:synchronization`);
      return true;
    }

    this.logService.log('--- End of synchronization: false ---', `${SyncService.name}:synchronization`);
    return false;
  };
}
