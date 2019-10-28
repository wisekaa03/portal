/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('calendar')
export class CalendarController {
  @UseGuards(SessionGuard)
  @Get()
  public async calendar(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/calendar');
  }
}
