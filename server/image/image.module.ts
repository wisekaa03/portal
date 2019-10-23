/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LoggerModule } from '../logger/logger.module';
import { ImageService } from './image.service';
// #endregion

@Module({
  imports: [LoggerModule],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
