/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { TicketDepartmentService } from './department.service';
import { TicketDepartmentResolver } from './department.resolver';
// #endregion

@Module({
  providers: [TicketDepartmentService, TicketDepartmentResolver],
  exports: [TicketDepartmentService],
})
export class TicketDepartmentModule {}
