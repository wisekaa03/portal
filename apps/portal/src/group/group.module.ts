/** @format */
// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { ConfigModule } from '@app/config';
import { LoggerModule } from '@app/logger';
import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';
import { GroupEntity } from './group.entity';
// #endregion

@Module({
  imports: [
    // #region Config module
    ConfigModule,
    LoggerModule,
    // #endregion

    // #region TypeORM
    TypeOrmModule.forFeature([GroupEntity]),
    // #endregion
  ],
  providers: [GroupService, GroupResolver],

  exports: [GroupService],
})
export class GroupModule {}
