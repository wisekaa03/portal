/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { TicketCommentsService } from './comments.service';
import { TicketCommentsResolver } from './comments.resolver';
// #endregion

@Module({
  providers: [TicketCommentsService, TicketCommentsResolver],
})
export class TicketCommentsModule {}
