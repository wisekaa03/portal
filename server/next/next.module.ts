/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { NextService } from './next.service';
import { LogService } from '../logger/logger.service';
// #endregion

@Module({
  imports: [LogService],
  providers: [NextService],
  exports: [NextService],
})
export class NextModule {}
