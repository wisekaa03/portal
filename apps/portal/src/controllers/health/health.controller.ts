/** @format */

// #region Imports NPM
import { Controller, Get } from '@nestjs/common';
// import { RenderableResponse } from 'nest-next-2';
// #endregion
// #region Imports Local
// #endregion

@Controller('health')
export class HealthController {
  @Get()
  public async health(): Promise<string> {
    return 'OK';
  }
}
