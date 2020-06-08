/** @format */

//#region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
//#endregion

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(SessionGuard)
  public async profile(@Res() response: RenderableResponse): Promise<void> {
    response.render('profile');
  }

  @Get('edit')
  @UseGuards(SessionGuard)
  public async editMe(@Res() response: RenderableResponse): Promise<void> {
    response.render('profile/edit');
  }

  @Get('edit/:id')
  @UseGuards(SessionGuard)
  public async editProfile(@Res() response: RenderableResponse, @Param('id') id: string): Promise<void> {
    response.render('profile/edit', { id });
  }

  @Get('task/:where/:code')
  @UseGuards(SessionGuard)
  public async ticket(
    @Res() response: RenderableResponse,
    @Param('where') where: string,
    @Param('code') code: string,
  ): Promise<void> {
    response.render('profile/task', { where, code });
  }

  @Get('equipment')
  @UseGuards(SessionGuard)
  public async equipment(@Res() response: RenderableResponse): Promise<void> {
    response.render('profile/equipment');
  }
}
