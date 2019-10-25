/** @format */

// #region Imports NPM
import { Controller, Get, Res } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
// #endregion

@Controller('profile')
export class ProfileController {
  @Get()
  public async profile(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/profile');
  }
}
