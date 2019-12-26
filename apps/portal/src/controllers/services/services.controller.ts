/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('services')
export class ServicesController {
  @Get()
  @UseGuards(SessionGuard)
  public async services(@Res() res: RenderableResponse): Promise<void> {
    return res.render('services');
  }
}
