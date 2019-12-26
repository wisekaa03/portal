/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('calendar')
export class CalendarController {
  @Get()
  @UseGuards(SessionGuard)
  public async calendar(@Res() res: RenderableResponse): Promise<void> {
    return res.render('calendar');
  }
}
