/** @format */

// #region Imports NPM
import { Module, Global } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { ImageService } from './image.service';
// #endregion

@Global()
@Module({
  imports: [LoggerModule],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
