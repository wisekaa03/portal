/** @format */

// #region Imports NPM
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
// #endregion
// #region Imports Local
import { NextService } from '../../next/next.service';
// #endregion

@Controller('phonebook')
export class PhonebookController {
  constructor(private readonly nextService: NextService) {}

  @Get()
  public async phonebook(@Req() req: Request, @Res() res: Response): Promise<void> {
    // eslint-disable-next-line no-debugger
    debugger;

    if (!req.user) {
      if (req.session) {
        req.session.lastPage = '/phonebook';
      }
      return res.redirect('/auth/login');
    }
    return this.nextService.render(req, res, '/phonebook');
  }
}
