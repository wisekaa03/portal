/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LogService } from './logger.service';
// #endregion

@Module({
  providers: [LogService],
  exports: [LogService],
})
export class LoggerModule {}
