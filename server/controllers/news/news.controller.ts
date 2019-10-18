/** @format */

// #region Imports NPM
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
// #endregion
// #region Imports Local
import { NextService } from '../../next/next.service';
// #endregion

@Controller('news')
export class NewsController {
  constructor(private readonly nextService: NextService) {}

  @Get()
  public async news(@Req() req: Request, @Res() res: Response): Promise<void> {
    if (!req.user) {
      if (req.session) {
        req.session.lastPage = '/news';
      }
      return res.redirect('/auth/login');
    }
    return this.nextService.render(req, res, '/news');
  }
}
