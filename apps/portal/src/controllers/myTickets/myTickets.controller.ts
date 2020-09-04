/** @format */

//#region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
//#endregion

@Controller('my-tickets')
export class MyTicketsController {
  @Get()
  @UseGuards(SessionGuard)
  public async myTickets(@Res() res: RenderableResponse): Promise<void> {
    res.render('myTickets');
  }

  @Get(':where/:code')
  @UseGuards(SessionGuard)
  public async myTicket(@Res() response: RenderableResponse, @Param('where') where: string, @Param('code') code: string): Promise<void> {
    response.render('myTickets', { where, code });
  }
}
