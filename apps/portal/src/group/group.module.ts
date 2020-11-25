/** @format */
//#region Imports NPM
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//#endregion
//#region Imports Local
import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';
import { GroupEntity } from './group.entity';
//#endregion

@Module({
  imports: [
    //#region TypeORM
    TypeOrmModule.forFeature([GroupEntity]),
    //#endregion
  ],
  providers: [Logger, GroupService, GroupResolver],

  exports: [GroupService],
})
export class GroupModule {}
