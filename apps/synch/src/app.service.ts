/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapService } from '@app/ldap';
import { UserService } from '../../portal/src/user/user.service';
import { ProfileService } from '../../portal/src/profile/profile.service';
import { UserEntity } from '../../portal/src/user/user.entity';
import { ProfileEntity } from '../../portal/src/profile/profile.entity';
// #endregion

@Injectable()
export class SynchService {
  constructor(
    private readonly logService: LogService,
    private readonly ldapService: LdapService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  synchronization = async (): Promise<boolean> => {
    const ldapUsers = await this.ldapService.synchronization();

    if (ldapUsers) {
      // eslint-disable-next-line no-restricted-syntax
      for (const ldapUser of ldapUsers) {
        if (ldapUser.sAMAccountName) {
          // eslint-disable-next-line no-await-in-loop
          const user = await this.userService.readByUsername(ldapUser.sAMAccountName, false, false);
          // eslint-disable-next-line no-await-in-loop
          await this.userService.createFromLdap(ldapUser, user, true, false);
        } else {
          // eslint-disable-next-line no-await-in-loop
          await this.profileService.createFromLdap(ldapUser, undefined, 1, true, false);
        }
      }

      this.logService.log('--- End of synchronization: true ---', 'Synch');
      return true;
    }

    this.logService.log('--- End of synchronization: false ---', 'Synch');
    return false;
  };
}
