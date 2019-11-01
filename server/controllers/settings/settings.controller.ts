/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('settings')
export class SettingsController {
  @Get()
  @UseGuards(SessionGuard)
  public async settings(@Res() res: RenderableResponse): Promise<void> {
    return res.render('settings');
  }
}
