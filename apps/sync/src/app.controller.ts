/** @format */

// #region Imports NPM
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { LDAP_SYNC } from '@lib/types';
import { SyncService } from './app.service';
// #endregion

@Controller()
export class AppController {
  constructor(private readonly syncService: SyncService) {}

  @MessagePattern(LDAP_SYNC)
  async synchronization(): Promise<boolean> {
    return this.syncService.synchronization();
  }
}
