/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(SessionGuard)
  public async profile(@Res() res: RenderableResponse): Promise<void> {
    return res.render('profile');
  }

  @Get('view')
  @UseGuards(SessionGuard)
  public async view(@Res() res: RenderableResponse): Promise<void> {
    return res.render('profile/view');
  }

  @Get('equipment')
  @UseGuards(SessionGuard)
  public async equipment(@Res() res: RenderableResponse): Promise<void> {
    return res.render('profile/equipment');
  }
}
