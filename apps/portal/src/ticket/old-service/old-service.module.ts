/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { TicketOldServiceResolver } from './old-service.resolver';
import { TicketOldServiceService } from './old-service.service';
// #endregion

@Module({
  providers: [TicketOldServiceResolver, TicketOldServiceService],
})
export class TicketOldServiceModule {}
