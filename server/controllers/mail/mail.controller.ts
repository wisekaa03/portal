/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('mail')
export class MailController {
  @Get()
  @UseGuards(SessionGuard)
  public async mail(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/mail');
  }
}
