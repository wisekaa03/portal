/** @format */

// #region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { ConfigModule } from '@app/config';
import { NewsService } from './news.service';
import { NewsResolver } from './news.resolver';
import { NewsEntity } from './news.entity';
// #endregion

@Module({
  imports: [
    // #region Config module
    HttpModule,
    ConfigModule,
    LoggerModule,
    // #endregion

    // #region TypeORM
    TypeOrmModule.forFeature([NewsEntity]),
    // #endregion
  ],
  providers: [NewsService, NewsResolver],
  exports: [NewsService],
})
export class NewsModule {}
