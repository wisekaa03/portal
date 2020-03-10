/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { ConfigModule } from '@app/config';
import { FilesService } from './files.service';
import { FilesResolver } from './files.resolver';
import { UserModule } from '../user/user.module';
import { FilesEntity } from './files.entity';
import { FilesFolderEntity } from './files.folder.entity';
// #endregion

@Module({
  imports: [
    // #region Config module
    ConfigModule,
    LoggerModule,
    // #endregion

    UserModule,

    // #region TypeORM
    TypeOrmModule.forFeature([FilesFolderEntity, FilesEntity]),
    // #endregion
  ],
  providers: [FilesService, FilesResolver],
})
export class FilesModule {}
