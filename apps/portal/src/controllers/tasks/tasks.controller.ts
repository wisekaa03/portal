/** @format */

//#region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
//#endregion

@Controller('tasks')
export class TasksController {
  @Get()
  @UseGuards(SessionGuard)
  public async tasks(@Res() res: RenderableResponse): Promise<void> {
    res.render('tickets/tasks');
  }
}
