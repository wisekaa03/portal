/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
//#endregion
//#region Imports Local
import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
import { TicketsResolver } from './tickets.resolver';
import { TicketsService } from './tickets.service';
//#endregion

@Module({
  imports: [HttpModule, SubscriptionsModule],

  providers: [TicketsService, TicketsResolver],
})
export class TicketsModule {}
