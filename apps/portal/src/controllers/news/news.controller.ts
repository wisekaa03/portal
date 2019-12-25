/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('news')
export class NewsController {
  @Get()
  @UseGuards(SessionGuard)
  public async news(@Res() res: RenderableResponse): Promise<void> {
    return res.render('news');
  }
}
