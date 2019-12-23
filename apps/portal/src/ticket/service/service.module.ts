/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { TicketServiceService } from './service.service';
import { TicketServiceResolver } from './service.resolver';
// #endregion

@Module({
  providers: [TicketServiceService, TicketServiceResolver],
})
export class TicketServiceModule {}
