/** @format */

// #region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { ConfigModule } from '@app/config';
import { LoggerModule } from '@app/logger';
import { ImageModule } from '@app/image';
// import { NewsEntity } from './news.entity';
import { NewsService } from './news.service';
import { NewsResolver } from './news.resolver';
// #endregion

@Module({
  imports: [
    // #region Config module
    HttpModule,
    ConfigModule,
    LoggerModule,
    ImageModule,
    // #endregion

    // #region TypeORM
    // TypeOrmModule.forFeature([NewsEntity]),
    // #endregion
  ],
  providers: [NewsService, NewsResolver],
  exports: [NewsService],
})
export class NewsModule {}
