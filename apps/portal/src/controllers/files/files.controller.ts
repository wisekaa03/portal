/** @format */

//#region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
//#endregion

@Controller('files')
export class FilesController {
  @Get()
  @UseGuards(SessionGuard)
  public async files(@Res() res: RenderableResponse): Promise<void> {
    res.render('files');
  }

  @Get('*')
  @UseGuards(SessionGuard)
  public async edit(@Res() res: RenderableResponse, @Param() param: string): Promise<void> {
    res.render('files', { path: param?.[0] });
  }
}
