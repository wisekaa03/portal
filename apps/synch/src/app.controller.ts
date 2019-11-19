/** @format */

// #region Imports NPM
import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { SYNCHRONIZATION } from './app.constants';
import { AppService } from './app.service';
// #endregion

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(SYNCHRONIZATION)
  async synchronization(): Promise<boolean> {
    return this.appService.synchronization();
  }
}
