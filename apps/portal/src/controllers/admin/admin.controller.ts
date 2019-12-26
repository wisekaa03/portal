/** @format */

// #region Imports NPM
import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('admin')
export class AdminController {
  @Get()
  @UseGuards(SessionGuard)
  admin(@Res() res: RenderableResponse): any {
    // render = (view: string, initialProps?: any) => any
    res.render('admin', {});
  }
}
