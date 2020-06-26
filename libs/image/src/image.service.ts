/** @format */
/* eslint prettier/prettier: 0 */

//#region Imports NPM
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import Sharp from 'sharp';
//#endregion
//#region Imports Local
//#endregion

@Injectable()
export class ImageService {
  constructor(@InjectPinoLogger(ImageService.name) private readonly logger: PinoLogger) {
  }

  // eslint-disable-next-line no-confusing-arrow
  imageResize = async (originalImage: Buffer, width = 48, height = 48): Promise<Buffer | undefined> =>
    !originalImage.toString('utf8').startsWith('<!DOCTYPE')
      ? Sharp(originalImage)
          .resize(width, height)
          .toBuffer()
          .catch((error) => {
            const message = error.toString();
            this.logger.error(
              `Error converting image: width=${width}, height=${height}, originalImage=${originalImage
                .toString('utf8')
                .slice(0, 20)}: ${message}`,
              message,
            );

            return originalImage;
          })
      : undefined;
}
