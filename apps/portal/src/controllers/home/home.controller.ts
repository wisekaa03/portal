/** @format */

// #region Imports NPM
import { Controller, Res, Get, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller()
export class HomeController {
  @Get()
  @UseGuards(SessionGuard)
  public async showHome(@Res() res: RenderableResponse): Promise<void> {
    return res.render('index');
  }
}
