/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('meetings')
export class MeetingsController {
  @Get()
  @UseGuards(SessionGuard)
  public async phonebook(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/meetings');
  }
}
