/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
// #endregion
// #region Imports Local
import { SessionGuard } from '@app/portal/guards/session.guard';
import { IsAdminGuard } from '@app/portal/guards/admin.guard';
// #endregion

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(SessionGuard)
  public async profile(@Res() res: RenderableResponse): Promise<void> {
    return res.render('profile');
  }

  @Get('edit')
  @UseGuards(SessionGuard)
  public async view(@Res() res: RenderableResponse): Promise<void> {
    return res.render('profile/edit');
  }

  @Get('edit/:id')
  @UseGuards(SessionGuard)
  @UseGuards(IsAdminGuard)
  public async edit(@Res() res: RenderableResponse, @Param('id') id: string): Promise<void> {
    return res.render(`profile/edit/${id}`);
  }

  @Get('equipment')
  @UseGuards(SessionGuard)
  public async equipment(@Res() res: RenderableResponse): Promise<void> {
    return res.render('profile/equipment');
  }
}
