/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards, Query } from '@nestjs/common';
import { RenderableResponse } from 'nest-next';
// #endregion
// #region Imports Local
import { SessionGuard } from '@app/portal/guards/session.guard';
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
  public async edit(@Res() res: RenderableResponse, @Query('id') id: string): Promise<void> {
    return res.render(`profile/edit`, { id });
  }

  @Get('ticket')
  @UseGuards(SessionGuard)
  public async ticket(@Res() res: RenderableResponse, @Query('id') id: string): Promise<void> {
    return res.render(`profile/ticket`, { id });
  }

  @Get('equipment')
  @UseGuards(SessionGuard)
  public async equipment(@Res() res: RenderableResponse): Promise<void> {
    return res.render('profile/equipment');
  }
}
