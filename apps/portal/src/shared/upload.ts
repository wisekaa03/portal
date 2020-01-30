/** @format */

// #region Imports NPM
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
// #endregion

/**
 * Constructing Uploads
 *
 * @param attachments {Promise<FileUpload>[]}
 * @param callback {(upload: { filename: string; mimetype: string; file: Buffer }) => void}
 * @returns {Promise<Promise<boolean>[]>}
 */
export const constructUploads = async (
  attachments: Promise<FileUpload>[],
  callback: (upload: { filename: string; mimetype: string; file: Buffer }) => void,
): Promise<Promise<boolean>[]> =>
  Promise.all(attachments)
    .then((attach: FileUpload[]): Promise<boolean>[] => {
      return attach.map((value: FileUpload) => {
        const { filename, mimetype, createReadStream } = value;

        return new Promise<boolean>((resolve, reject) => {
          const bufs: any[] = [];

          return createReadStream()
            .on('error', (error) => {
              reject(error);
            })
            .on('data', (chunk) => {
              bufs.push(chunk);
            })
            .on('end', () => {
              // eslint-disable-next-line promise/no-callback-in-promise
              callback({ filename, mimetype, file: Buffer.concat(bufs) });

              resolve(true);
            });
        });
      });
    })
    .catch((error: Error) => {
      throw error;
    });
