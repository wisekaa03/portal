/** @format */

// #region Imports NPM
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
// #endregion
// #region Imports Local
import { NextService } from '../../next/next.service';
// #endregion

@Controller('mail')
export class MailController {
  constructor(private readonly nextService: NextService) {}

  @Get()
  public async mail(@Req() req: Request, @Res() res: Response): Promise<void> {
    // eslint-disable-next-line no-debugger
    // debugger;

    if (!req.user) {
      if (req.session) {
        req.session.lastPage = '/mail';
      }
      return res.redirect('/auth/login');
    }
    return this.nextService.render(req, res, '/mail');
  }
}
