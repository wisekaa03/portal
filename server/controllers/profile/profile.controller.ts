/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(SessionGuard)
  public async profile(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/profile');
  }
}
