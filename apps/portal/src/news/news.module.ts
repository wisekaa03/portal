/** @format */

//#region Imports NPM
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//#endregion
//#region Imports Local
import { NewsService } from './news.service';
import { NewsResolver } from './news.resolver';
import { News } from './news.entity';
import { UserModule } from '../user/user.module';
//#endregion

@Module({
  imports: [
    UserModule,

    //#region TypeORM
    TypeOrmModule.forFeature([News]),
    //#endregion
  ],
  providers: [Logger, NewsService, NewsResolver],
  exports: [NewsService],
})
export class NewsModule {}
