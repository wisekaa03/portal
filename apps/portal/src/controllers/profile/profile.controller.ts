/** @format */

//#region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
//#endregion
//#region Imports Local
import { SessionGuard } from '@back/guards/session.guard';
import { SessionAdminGuard } from '@back/guards/session-admin.guard';
//#endregion

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(SessionGuard)
  public async profile(@Res() response: RenderableResponse): Promise<void> {
    response.render('profile');
  }

  @Get('edit/new')
  @UseGuards(SessionAdminGuard)
  public async editNew(@Res() response: RenderableResponse): Promise<void> {
    response.render('profile/new');
  }

  @Get('edit')
  @UseGuards(SessionGuard)
  public async editMe(@Res() response: RenderableResponse): Promise<void> {
    response.render('profile/edit');
  }

  @Get('edit/:id')
  @UseGuards(SessionAdminGuard)
  public async editProfile(@Res() response: RenderableResponse, @Param('id') id: string): Promise<void> {
    response.render('profile/edit', { id });
  }

  @Get('equipment')
  @UseGuards(SessionGuard)
  public async equipment(@Res() response: RenderableResponse): Promise<void> {
    response.render('profile/equipment');
  }
}
