/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
// #endregion

@Injectable()
export class AppService {
  synchronization(): boolean {
    // const users = await this.ldapService.synchronization();

    // if (users) {
    //   users.forEach(async (ldapUser) => {
    //     const user = await this.readByUsername(ldapUser.sAMAccountName, false);

    //     this.createLdap(ldapUser, user).catch((error: Error) => {
    //       this.logService.error('Unable to save data in `synchronization`', error.toString(), 'UsersService');

    //       throw error;
    //     });
    //   });

    //   return true;
    // }

    // return false;

    return true;
  }
}
