/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('itapplication')
export class ItapplicationController {
  @Get()
  @UseGuards(SessionGuard)
  public async itapplication(@Res() res: RenderableResponse): Promise<void> {
    return res.render('itapplication');
  }
}
