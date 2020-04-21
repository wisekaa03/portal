/** @format */
/* eslint prettier/prettier: 0 */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import Sharp from 'sharp';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
// #endregion

@Injectable()
export class ImageService {
  constructor(private readonly logger: LogService) {
    logger.setContext(ImageService.name);
  }

  // eslint-disable-next-line no-confusing-arrow
  imageResize = async (originalImage: Buffer, width = 48, height = 48): Promise<Buffer | undefined> =>
    !originalImage.toString('utf8').match(/^<!DOCTYPE/)
      ? Sharp(originalImage)
          .resize(width, height)
          .toBuffer()
          .catch((error) => {
            this.logger.error(
              `Error converting image: width=${width}, height=${height}, originalImage=${originalImage
                .toString('utf8')
                .slice(0, 20)}`,
              error,
            );

            return originalImage;
          })
      : undefined;
}
