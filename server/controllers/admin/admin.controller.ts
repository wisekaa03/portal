/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('admin')
export class AdminController {
  @Get()
  @UseGuards(SessionGuard)
  async admin(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/admin');
  }
}
