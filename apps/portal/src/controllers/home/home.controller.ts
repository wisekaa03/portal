/** @format */

// #region Imports NPM
import { Controller, Res, Get, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
// #endregion
// #region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
// #endregion

@Controller()
export class HomeController {
  @Get()
  @UseGuards(SessionGuard)
  public async showHome(@Res() res: RenderableResponse): Promise<void> {
    res.render('index');
  }
}
