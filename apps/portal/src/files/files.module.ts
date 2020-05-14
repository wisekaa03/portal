/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { UserModule } from '@back/user/user.module';
import { FilesService } from './files.service';
import { FilesResolver } from './files.resolver';
import { FilesEntity } from './files.entity';
import { FilesFolderEntity } from './files.folder.entity';
// #endregion

@Module({
  imports: [
    UserModule,

    // #region TypeORM
    TypeOrmModule.forFeature([FilesFolderEntity, FilesEntity]),
    // #endregion
  ],
  providers: [FilesService, FilesResolver],
})
export class FilesModule {}
