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

  synchronization = async (): Promise<boolean> => {
    const ldapUsers = await this.ldapService.synchronization().catch((error: Error) => {
      this.logService.error('Unable to synchronize LDAP', error.toString(), 'Synch Microservice');

      throw error;
    });

    if (!ldapUsers) {
      return false;
    }

    ldapUsers.forEach((ldapUser) => {
      this.userService
        .readByUsername(ldapUser.sAMAccountName, false)
        .then((user) =>
          // eslint-disable-next-line promise/no-nesting
          this.userService.createFromLdap(ldapUser, user).catch((error: Error) => {
            this.logService.error(
              `Unable to save data in synchronization: "${ldapUser.sAMAccountName}"`,
              error.toString(),
              'Synch Microservice',
            );

            throw error;
          }),
        )
        .catch((error: Error) => {
          this.logService.error(
            `Unable to find user: "${ldapUser.sAMAccountName}"`,
            error.toString(),
            'Synch Microservice',
          );

          throw error;
        });
    });

    return true;
  };
}
