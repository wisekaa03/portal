/** @format */

//#region Imports NPM
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { FileUploadBuffer } from '@lib/types';
//#endregion

/**
 * Constructing Uploads
 *
 * @param attachments {Promise<FileUpload>[]}
 * @param callback {(upload: FileUploadBuffer) => any}
 * @returns {Promise<FileUploadBuffer[]>}
 */
export const constructUploads = async (
  attachments: Promise<FileUpload>[],
  callback: (upload: FileUploadBuffer) => void,
): Promise<FileUploadBuffer[]> => {
  const files = await Promise.all(attachments)
    .then((attach: FileUpload[]): Promise<FileUploadBuffer>[] =>
      attach.map((value: FileUpload) => {
        const { createReadStream, ...rest } = value;
        const buffer: Uint8Array[] = [];

        return new Promise<FileUploadBuffer>((resolve, reject) => {
          createReadStream()
            .on('error', (error) => {
              reject(error);
            })
            .on('data', (chunk: Uint8Array) => {
              buffer.push(chunk);
            })
            .on('end', () => {
              resolve({ ...rest, file: Buffer.concat(buffer) });
            });
        });
      }),
    )
    .then((filesPromise: Promise<FileUploadBuffer>[]) => Promise.all(filesPromise))
    .catch((error: Error) => {
      throw error;
    });

  files.forEach((file) => {
    callback(file);
  });

  return files;
};
