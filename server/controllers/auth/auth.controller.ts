/** @format */

// #region Imports NPM
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
// #endregion
// #region Imports Local
import { NextService } from '../../next/next.service';
// #endregion

// @ApiUseTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly nextService: NextService) {}

  @Get('login')
  public async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    if (req.user) {
      // TODO: это выполняется до запроса в graphql, который идет следующим запросом
      return res.redirect('/');
    }
    return this.nextService.render(req, res, '/auth/login');
  }

  @Get('logout')
  public async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    if (req.user) {
      // TODO: это выполняется до запроса в graphql, который идет следующим запросом
      return res.redirect('/auth/login');
    }
    return this.nextService.render(req, res, '/auth/logout');
  }
}
