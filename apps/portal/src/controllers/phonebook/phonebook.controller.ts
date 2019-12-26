/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
// #endregion
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('phonebook')
export class PhonebookController {
  @Get()
  @UseGuards(SessionGuard)
  public async phonebook(@Res() res: RenderableResponse): Promise<void> {
    return res.render('phonebook');
  }
}
