/** @format */

// #region Imports NPM
import { Controller, Res, Get } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
// #endregion

@Controller()
export class HomeController {
  @Get()
  public async showHome(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/index');
  }
}
