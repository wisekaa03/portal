/** @format */

//#region Imports NPM
import { Module } from '@nestjs/common';
//#endregion
//#region Imports Local
import { UserModule } from '@back/user/user.module';
import { SubscriptionsModule } from '@back/subscriptions/subscriptions.module';
import { FilesService } from './files.service';
import { FilesResolver } from './files.resolver';
//#endregion

@Module({
  imports: [UserModule, SubscriptionsModule],
  providers: [FilesService, FilesResolver],
})
export class FilesModule {}
