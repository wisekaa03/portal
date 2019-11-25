/** @format */

// #region Imports NPM
import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { SOAP1C } from './app.constants';
import { AppService } from './app.service';
// #endregion

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern(SOAP1C)
  async synchronization(): Promise<string> {
    return this.appService.synchronization();
  }
}
