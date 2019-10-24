/** @format */

// #region Imports NPM
import { Controller, Get, Res } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';

// #endregion
// #region Imports Local
// #endregion

@Controller('phonebook')
export class PhonebookController {
  @Get()
  public async phonebook(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/phonebook');
  }
}
