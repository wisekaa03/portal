/** @format */

//#region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
//#endregion

@Controller('services')
export class ServicesController {
  @Get()
  @UseGuards(SessionGuard)
  public async services(@Res() res: RenderableResponse): Promise<void> {
    res.render('services');
  }

  @Get(':where')
  @UseGuards(SessionGuard)
  public async department(@Res() res: RenderableResponse, @Param('where') where: string): Promise<void> {
    res.render('services', { where });
  }

  @Get(':where/:route')
  @UseGuards(SessionGuard)
  public async service(
    @Res() res: RenderableResponse,
    @Param('where') where: string,
    @Param('route') route: string,
  ): Promise<void> {
    res.render('services', { where, route });
  }
}
