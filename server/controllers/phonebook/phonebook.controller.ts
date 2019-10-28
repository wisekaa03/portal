/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
// #endregion
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('phonebook')
export class PhonebookController {
  @UseGuards(SessionGuard)
  @Get()
  public async phonebook(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/phonebook');
  }
}
