/** @format */

//#region Imports NPM
import { Injectable } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
//#endregion
//#region Imports Local
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

      this.logger.info('--- End of synchronization: true ---');
      return true;
    }

    this.logger.info('--- End of synchronization: false ---');
    return false;
  };
}
