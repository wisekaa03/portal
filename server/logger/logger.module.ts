/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LoggerService } from './logger.service';
// #endregion

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
