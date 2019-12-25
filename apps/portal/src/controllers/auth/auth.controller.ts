/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
import { SessionGuard } from '../../guards/session.guard';
// #endregion
// #region Imports Local
// #endregion

// @ApiUseTags('auth')
@Controller('auth')
export class AuthController {
  @Get('login')
  public async login(@Res() res: RenderableResponse): Promise<void> {
    return res.render('auth/login');
  }

  @Get('logout')
  @UseGuards(SessionGuard)
  public async logout(@Res() res: RenderableResponse): Promise<void> {
    return res.render('auth/logout');
  }
}
