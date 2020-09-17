/** @format */

//#region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
//#endregion

@Controller('tickets')
export class TicketsController {
  @Get()
  @UseGuards(SessionGuard)
  public async services(@Res() res: RenderableResponse): Promise<void> {
    res.render('tickets/tickets');
  }

  @Get(':where')
  @UseGuards(SessionGuard)
  public async where(@Res() res: RenderableResponse, @Param('where') where: string): Promise<void> {
    res.render('tickets/tickets', { where });
  }

  @Get(':where/:route')
  @UseGuards(SessionGuard)
  public async route(@Res() res: RenderableResponse, @Param('where') where: string, @Param('route') route: string): Promise<void> {
    res.render('tickets/tickets', { where, route });
  }

  @Get(':where/:route/:service')
  @UseGuards(SessionGuard)
  public async service(
    @Res() res: RenderableResponse,
    @Param('where') where: string,
    @Param('route') route: string,
    @Param('service') service: string,
  ): Promise<void> {
    res.render('tickets', { where, route, service });
  }
}
