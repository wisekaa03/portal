/** @format */
// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigModule } from '@app/config';
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
