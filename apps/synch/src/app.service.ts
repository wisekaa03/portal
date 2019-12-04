/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { LdapService } from '@app/ldap';
import { UserService } from '../../portal/src/user/user.service';
// #endregion

@Injectable()
export class SynchService {
  constructor(
    private readonly logService: LogService,
    private readonly ldapService: LdapService,
    private readonly userService: UserService,
  ) {}

  async synchronization(): Promise<boolean> {
    const users = await this.ldapService.synchronization();

    if (users) {
      users.forEach(async (ldapUser) => {
        try {
          const user = await this.userService.readByUsername(ldapUser.sAMAccountName, false);

          this.userService.createFromLdap(ldapUser, user).catch((error: Error) => {
            this.logService.error('Unable to save data in `synchronization`', error.toString(), 'UsersService');
            throw error;
          });
        } catch (error) {
          this.logService.error('Unable to save data in `synchronization`', error.toString(), 'UsersService');
        }
      });

      return true;
    }

    return false;
  }
}
