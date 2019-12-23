/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { TicketsService } from './tickets.service';
import { TicketsResolver } from './tickets.resolver';
// #endregion

@Module({
  providers: [TicketsService, TicketsResolver],
})
export class TicketsModule {}
