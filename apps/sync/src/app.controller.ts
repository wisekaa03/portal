/** @format */

//#region Imports NPM
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import type { LoggerContext } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { LDAP_SYNC } from '@back/shared/constants';
import { SyncService } from './app.service';
//#endregion

@Controller()
export class AppController {
  constructor(private readonly syncService: SyncService) {}

  @MessagePattern(LDAP_SYNC)
  async synchronization({ loggerContext }: { loggerContext?: LoggerContext }): Promise<boolean> {
    const syncResult = await this.syncService.synchronization({ loggerContext });

    return syncResult;
  }
}
