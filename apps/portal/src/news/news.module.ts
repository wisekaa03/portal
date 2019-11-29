/** @format */

// #region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { ConfigModule } from '@app/config';
import { NewsService } from './news.service';
import { NewsResolver } from './news.resolver';
// #endregion

@Module({
  imports: [
    // #region Config module
    HttpModule,
    ConfigModule,
    LoggerModule,
    // #endregion
  ],
  providers: [NewsService, NewsResolver],
  exports: [NewsService],
})
export class NewsModule {}
