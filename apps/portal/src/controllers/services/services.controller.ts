/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
// #endregion
// #region Imports Local
import { SessionGuard } from '../../guards/session.guard';
// #endregion

@Controller('services')
export class ServicesController {
  @Get()
  @UseGuards(SessionGuard)
  public async services(@Res() res: RenderableResponse): Promise<void> {
    return res.render('services');
  }

  @Get(':department')
  @UseGuards(SessionGuard)
  public async department(@Res() res: RenderableResponse, @Param('department') department: string): Promise<void> {
    return res.render('services', { department });
  }

  @Get(':department/:service')
  @UseGuards(SessionGuard)
  public async service(
    @Res() res: RenderableResponse,
    @Param('department') department: string,
    @Param('service') service: string,
  ): Promise<void> {
    return res.render('services', { department, service });
  }

  @Get(':department/:service/:category')
  @UseGuards(SessionGuard)
  public async category(
    @Res() res: RenderableResponse,
    @Param('department') department: string,
    @Param('service') service: string,
    @Param('category') category: string,
  ): Promise<void> {
    return res.render('services', { department, service, category });
  }
}
