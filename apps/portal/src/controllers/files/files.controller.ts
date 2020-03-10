/** @format */
/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
// #endregion
// #region Imports Local
import { SessionGuard } from '@app/portal/guards/session.guard';
// #endregion

@Controller('files')
export class FilesController {
  @Get()
  @UseGuards(SessionGuard)
  public async media(@Res() res: RenderableResponse): Promise<void> {
    return res.render('files');
  }

  @Get('edit')
  @UseGuards(SessionGuard)
  public async edit(@Res() res: RenderableResponse): Promise<void> {
    return res.render('files/edit');
  }
}
