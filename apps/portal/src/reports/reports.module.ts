/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
//#endregion
//#region Imports Local
import { TIMEOUT } from '@back/shared/constants';
import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
import { ReportsResolver } from './reports.resolver';
import { ReportsService } from './reports.service';
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

  providers: [ReportsService, ReportsResolver],
})
export class ReportsModule {}
