/** @format */

// #region Imports NPM
import { Controller, Get, Res } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
// #region Imports Local
// #endregion

@Controller('mail')
export class MailController {
  @Get()
  public async mail(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/mail');
  }
}
