/** @format */

//#region Imports NPM
import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
//#endregion

@Controller('admin')
export class AdminController {
  @Get()
  @UseGuards(SessionGuard)
  public async admin(@Res() res: RenderableResponse): Promise<void> {
    // render = (view: string, initialProps?: any) => any
    res.render('admin', {});
  }
}
