/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('faq')
export class FaqController {
  @Get()
  @UseGuards(SessionGuard)
  public async faq(@Res() res: RenderableResponse): Promise<void> {
    return res.render('faq');
  }
}
