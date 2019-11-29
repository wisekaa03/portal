/** @format */
// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';
// #endregion

@Module({
  providers: [GroupService, GroupResolver],
})
export class GroupModule {}
