/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { TicketGroupServiceService } from './group-service.service';
import { TicketGroupServiceResolver } from './group-service.resolver';
// #endregion

@Module({
  providers: [TicketGroupServiceService, TicketGroupServiceResolver],
})
export class TicketGroupServiceModule {}
