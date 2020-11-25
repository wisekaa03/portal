/** @format */

//#region Imports NPM
import { HttpModule, Logger, Module } from '@nestjs/common';
//#endregion
//#region Imports Local
import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
import { TicketsResolver } from './tickets.resolver';
import { TicketsService } from './tickets.service';
//#endregion

@Module({
  imports: [HttpModule, SubscriptionsModule],
  providers: [Logger, TicketsService, TicketsResolver],
})
export class TicketsModule {}
