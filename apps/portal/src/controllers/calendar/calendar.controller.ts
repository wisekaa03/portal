/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
// #endregion
// #region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
// #endregion

@Controller('calendar')
export class CalendarController {
  @Get()
  @UseGuards(SessionGuard)
  public async calendar(@Res() res: RenderableResponse): Promise<void> {
    return res.render('calendar');
  }
}
