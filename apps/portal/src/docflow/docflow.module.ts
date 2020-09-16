/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
//#endregion
//#region Imports Local
import { DocFlowResolver } from './docflow.resolver';
import { DocFlowService } from './docflow.service';
//#endregion

@Module({
  imports: [HttpModule],

  providers: [DocFlowService, DocFlowResolver],
})
export class DocFlowModule {}
