/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { NextService } from './next.service';
import { LoggerService } from '../logger/logger.service';
// #endregion

@Module({
  imports: [LoggerService],
  providers: [NextService],
  exports: [NextService],
})
export class NextModule {}
