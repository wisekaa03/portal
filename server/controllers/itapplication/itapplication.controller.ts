/** @format */

// #region Imports NPM
import { Controller, Get, Res } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
// #endregion

@Controller('itapplication')
export class ItapplicationController {
  @Get()
  public async itapplication(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/itapplication');
  }
}
