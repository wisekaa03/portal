/** @format */

//#region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
//#endregion

@Controller('task')
export class TaskController {
  @Get(':where/:code')
  @UseGuards(SessionGuard)
  public async task(@Res() response: RenderableResponse, @Param('where') where: string, @Param('code') code: string): Promise<void> {
    response.render('task', { where, code });
  }
}
