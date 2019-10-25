/** @format */

// #region Imports NPM
import { Controller, Get, Res } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
// #endregion

@Controller('faq')
export class FaqController {
  @Get()
  public async faq(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/faq');
  }
}
