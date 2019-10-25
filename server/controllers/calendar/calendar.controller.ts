/** @format */

// #region Imports NPM
import { Controller, Get, Res } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
// #endregion

@Controller('calendar')
export class CalendarController {
  @Get()
  public async calendar(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/calendar');
  }
}
