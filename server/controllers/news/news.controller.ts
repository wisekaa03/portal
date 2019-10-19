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
    return this.nextService.render(req, res, '/news');
  }
}
