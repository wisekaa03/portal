/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
// #endregion
// #region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
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
