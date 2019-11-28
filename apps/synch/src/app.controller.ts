/** @format */

// #region Imports NPM
import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { SYNCHRONIZATION } from './app.constants';
import { SynchService } from './app.service';
// #endregion

@Controller()
export class AppController {
  constructor(private readonly synchService: SynchService) {}

  @MessagePattern(SYNCHRONIZATION)
  async synchronization(): Promise<boolean> {
    return this.synchService.synchronization();
  }
}
