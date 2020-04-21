/** @format */

// #region Imports NPM
import { Module, Global } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LogModule } from '@app/logger';
import { ImageService } from './image.service';
// #endregion

@Global()
@Module({
  imports: [LogModule],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
