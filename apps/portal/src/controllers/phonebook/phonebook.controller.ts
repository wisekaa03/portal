/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
// #endregion
import { SessionGuard } from '@back/guards/session.guard';
// #endregion

@Controller('phonebook')
export class PhonebookController {
  @Get()
  @UseGuards(SessionGuard)
  public async phonebook(@Res() res: RenderableResponse): Promise<void> {
    return res.render('phonebook');
  }

  @Get(':id')
  @UseGuards(SessionGuard)
  public async phonebookProfile(@Res() res: RenderableResponse, @Param('id') id: string): Promise<void> {
    return res.render('phonebook', { id });
  }
}
