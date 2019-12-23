/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { TicketAttachmentsService } from './attachments.service';
import { TicketAttachmentsResolver } from './attachments.resolver';
// #endregion

@Module({
  providers: [TicketAttachmentsService, TicketAttachmentsResolver],
})
export class TicketAttachmentsModule {}
