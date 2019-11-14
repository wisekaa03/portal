/** @format */

// #region Imports NPM
import { Module, Global } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LogService } from './logger.service';
// #endregion

@Global()
@Module({
  providers: [LogService],
  exports: [LogService],
})
export class LoggerModule {}
