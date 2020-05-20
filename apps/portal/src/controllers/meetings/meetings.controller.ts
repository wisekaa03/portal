/** @format */

//#region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
//#endregion

@Controller('meetings')
export class MeetingsController {
  @Get()
  @UseGuards(SessionGuard)
  public async phonebook(@Res() res: RenderableResponse): Promise<void> {
    res.render('meetings');
  }
}
