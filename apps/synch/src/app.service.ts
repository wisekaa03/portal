/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { LogService } from '../../portal/src/logger/logger.service';
import { LdapService } from '../../portal/src/ldap/ldap.service';
import { UserService } from '../../portal/src/user/user.service';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class AppService {
  constructor(
    private readonly logService: LogService,
    private readonly ldapService: LdapService,
    private readonly userService: UserService,
  ) {}

  async synchronization(): Promise<boolean> {
    const users = await this.ldapService.synchronization();

    if (users) {
      users.forEach(async (ldapUser) => {
        const user = await this.userService.readByUsername(ldapUser.sAMAccountName, false);

        this.userService.createLdap(ldapUser, user).catch((error: Error) => {
          this.logService.error('Unable to save data in `synchronization`', error.toString(), 'UsersService');

          throw error;
        });
      });

      return true;
    }

    return false;
  }
}
