/** @format */
/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
// #endregion
// #region Imports Local
import { SessionGuard } from '@app/portal/guards/session.guard';
// #endregion

@Controller('files')
export class FilesController {
  @Get()
  @UseGuards(SessionGuard)
  public async files(@Res() res: RenderableResponse): Promise<void> {
    return res.render('files');
  }

  @Get(':id')
  @UseGuards(SessionGuard)
  public async edit(@Res() res: RenderableResponse, @Param('id') id: string): Promise<void> {
    return res.render('files', { id });
  }
}
