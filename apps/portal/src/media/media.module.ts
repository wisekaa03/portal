/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { ConfigModule } from '@app/config';
import { MediaService } from './media.service';
import { MediaResolver } from './media.resolver';
import { UserModule } from '../user/user.module';
import { MediaEntity } from './media.entity';
import { MediaFolderEntity } from './media.folder.entity';
// #endregion

@Module({
  imports: [
    // #region Config module
    ConfigModule,
    LoggerModule,
    // #endregion

    UserModule,

    // #region TypeORM
    TypeOrmModule.forFeature([MediaFolderEntity, MediaEntity]),
    // #endregion
  ],
  providers: [MediaService, MediaResolver],
})
export class MediaModule {}
