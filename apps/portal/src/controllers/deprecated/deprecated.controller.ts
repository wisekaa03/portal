/** @format */

//#region Imports NPM
import { ServerResponse } from 'http';
import { Controller, Get, Res, Redirect, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
//#endregion

@Controller('services')
export class DeprecatedController {
  @Get()
  @Redirect('/tasks')
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async services(): Promise<void> {}
}
