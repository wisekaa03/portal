/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('news')
export class NewsController {
  @Get()
  @UseGuards(SessionGuard)
  public async news(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/news');
  }
}
