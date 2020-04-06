/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
// #endregion
// #region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
// #endregion

@Controller('faq')
export class FaqController {
  @Get()
  @UseGuards(SessionGuard)
  public async faq(@Res() res: RenderableResponse): Promise<void> {
    res.render('faq');
  }
}
