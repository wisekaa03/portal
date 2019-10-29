/** @format */

// #region Imports NPM
import { Controller, Res, Get, UseGuards } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller()
export class HomeController {
  @Get()
  @UseGuards(SessionGuard)
  public async showHome(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/index');
  }
}
