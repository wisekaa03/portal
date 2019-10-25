/** @format */

// #region Imports NPM
import { Controller, Get, Res } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
// #endregion

@Controller('admin')
export class AdminController {
  @Get()
  public async admin(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/admin');
  }
}
