/** @format */

// #region Imports NPM
import { Module, Global } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ImageService } from './image.service';
// #endregion

@Global()
@Module({
  imports: [LoggerModule],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
