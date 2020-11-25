/** @format */

//#region Imports NPM
import { Logger, Module } from '@nestjs/common';
//#endregion
//#region Imports Local
import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
import { ReportsResolver } from './reports.resolver';
import { ReportsService } from './reports.service';
//#endregion

@Module({
  imports: [SubscriptionsModule],

  providers: [Logger, ReportsService, ReportsResolver],
})
export class ReportsModule {}
