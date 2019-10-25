/** @format */

// #region Imports NPM
import { Controller, Get, Res } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
// #endregion

@Controller('settings')
export class SettingsController {
  @Get()
  public async settings(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/settings');
  }
}
