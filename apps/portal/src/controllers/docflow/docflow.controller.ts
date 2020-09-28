/** @format */

//#region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
//#endregion

@Controller('docflow')
export class DocFlowController {
  @Get()
  @UseGuards(SessionGuard)
  public async tasks(@Res() res: RenderableResponse): Promise<void> {
    res.render('docflow');
  }

  @Get('task/:docFlowTask')
  @UseGuards(SessionGuard)
  public async task(@Res() res: RenderableResponse, @Param('docFlowTask') docFlowTask: string): Promise<void> {
    res.render('docflow', { docFlowTask });
  }

  @Get('target/:docFlowTask')
  @UseGuards(SessionGuard)
  public async target(@Res() res: RenderableResponse, @Param('docFlowTarget') docFlowTarget: string): Promise<void> {
    res.render('docflow', { docFlowTarget });
  }
}
