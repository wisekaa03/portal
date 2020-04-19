/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
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
