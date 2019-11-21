/** @format */

// #region Imports NPM
import { Controller, Get } from '@nestjs/common';
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
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
