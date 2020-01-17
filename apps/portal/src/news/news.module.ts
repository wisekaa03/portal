/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { ConfigModule } from '@app/config';
import { NewsService } from './news.service';
import { NewsResolver } from './news.resolver';
import { NewsEntity } from './news.entity';
import { UserModule } from '../user/user.module';
// #endregion

@Module({
  imports: [
    // #region Config module
    ConfigModule,
    LoggerModule,
    // #endregion

    UserModule,

    // #region TypeORM
    TypeOrmModule.forFeature([NewsEntity]),
    // #endregion
  ],
  providers: [NewsService, NewsResolver],
  exports: [NewsService],
})
export class NewsModule {}
