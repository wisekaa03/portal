/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
//#endregion
//#region Imports Local
import { TIMEOUT } from '@back/shared/constants';
import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
import { DocFlowResolver } from './docflow.resolver';
import { DocFlowService } from './docflow.service';
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

  providers: [DocFlowService, DocFlowResolver],
})
export class DocFlowModule {}
