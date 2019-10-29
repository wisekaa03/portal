/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('settings')
export class SettingsController {
  @Get()
  @UseGuards(SessionGuard)
  public async settings(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/settings');
  }
}
