/** @format */

// #region Imports NPM
import { Controller, Get, Res } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
// #endregion

@Controller('news')
export class NewsController {
  @Get()
  public async news(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/news');
  }
}
