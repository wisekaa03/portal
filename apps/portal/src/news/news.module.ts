/** @format */

// #region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
// import { NewsEntity } from './news.entity';
import { NewsService } from './news.service';
import { NewsResolver } from './news.resolver';
// #endregion

@Module({
  imports: [
    // #region Config module
    HttpModule,
    LoggerModule,
    // #endregion

    // #region TypeORM
    // TypeOrmModule.forFeature([NewsEntity]),
    // #endregion
  ],
  providers: [NewsService, NewsResolver],
  exports: [NewsService],
})
export class NewsModule {}
