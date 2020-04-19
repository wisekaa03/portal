/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigModule } from '@app/config';
import { UserModule } from '@back/user/user.module';
import { FilesService } from './files.service';
import { FilesResolver } from './files.resolver';
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
