/** @format */

//#region Imports NPM
import { Module, Global, Logger } from '@nestjs/common';
//#endregion
//#region Imports Local
import { ImageService } from './image.service';
//#endregion

@Global()
@Module({
  imports: [],
  providers: [Logger, ImageService],
  exports: [ImageService],
})
export class ImageModule {}
