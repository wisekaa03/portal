/** @format */

//#region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//#endregion
//#region Imports Local
import { NewsService } from './news.service';
import { NewsResolver } from './news.resolver';
import { NewsEntity } from './news.entity';
import { UserModule } from '../user/user.module';
//#endregion

@Module({
  imports: [
    UserModule,

    //#region TypeORM
    TypeOrmModule.forFeature([NewsEntity]),
    //#endregion
  ],
  providers: [NewsService, NewsResolver],
  exports: [NewsService],
})
export class NewsModule {}
