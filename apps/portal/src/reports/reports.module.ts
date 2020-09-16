/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
//#endregion
//#region Imports Local
import { ReportsResolver } from './reports.resolver';
import { ReportsService } from './reports.service';
//#endregion

@Module({
  imports: [HttpModule],

  providers: [ReportsService, ReportsResolver],
})
export class ReportsModule {}
