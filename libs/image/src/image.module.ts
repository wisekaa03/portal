/** @format */

//#region Imports NPM
import { Module, Global } from '@nestjs/common';
//#endregion
//#region Imports Local
import { ImageService } from './image.service';
//#endregion

@Global()
@Module({
  imports: [],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
