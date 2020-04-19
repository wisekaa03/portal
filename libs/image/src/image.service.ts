/** @format */
/* eslint prettier/prettier: 0 */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import Sharp from 'sharp';
// #endregion
// #region Imports Local
import { Logger } from '@app/logger';
// #endregion

@Injectable()
export class ImageService {
  constructor(private readonly logService: Logger) {}

  // eslint-disable-next-line no-confusing-arrow
  imageResize = async (originalImage: Buffer, width = 48, height = 48): Promise<Buffer | undefined> =>
    !originalImage.toString('utf8').match(/^<!DOCTYPE/)
      ? Sharp(originalImage)
          .resize(width, height)
          .toBuffer()
          .catch((error) => {
            this.logService.error(
              `Error converting image: width=${width}, height=${height}, originalImage=${originalImage
                .toString('utf8')
                .slice(0, 20)}`,
              error,
              'ImageService',
            );

            return originalImage;
          })
      : undefined;
}
