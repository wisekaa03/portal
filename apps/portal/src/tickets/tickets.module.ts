/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
//#endregion
//#region Imports Local
import { TIMEOUT } from '@back/shared/constants';
import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
import { TicketsResolver } from './tickets.resolver';
import { TicketsService } from './tickets.service';
//#endregion

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: TIMEOUT,
      }),
    }),
    SubscriptionsModule,
  ],

  providers: [TicketsService, TicketsResolver],
})
export class TicketsModule {}
