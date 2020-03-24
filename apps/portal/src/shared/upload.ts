/** @format */

// #region Imports NPM
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
// #endregion

export interface FileUploadBuffer extends Pick<FileUpload, 'filename' | 'mimetype' | 'encoding'> {
  file: Buffer;
}

/**
 * Constructing Uploads
 *
 * @param attachments {Promise<FileUpload>[]}
 * @param callback {(upload: FileUploadBuffer) => any}
 * @returns {Promise<any[]>}
 */
export const constructUploads = async (
  attachments: Promise<FileUpload>[],
  callback: (upload: FileUploadBuffer) => any,
): Promise<any[]> => {
  return (
    Promise.all(attachments)
      .then((attach: FileUpload[]): Promise<FileUploadBuffer>[] =>
        attach.map((value: FileUpload) => {
          const { createReadStream, ...rest } = value;
          const bufs: any[] = [];

          return new Promise<FileUploadBuffer>((resolve, reject) => {
            createReadStream()
              .on('error', (error) => {
                reject(error);
              })
              .on('data', (chunk) => {
                bufs.push(chunk);
              })
              .on('end', () => {
                resolve({ ...rest, file: Buffer.concat(bufs) });
              });
          });
        }),
      )
      .then((filesPromise: Promise<FileUploadBuffer>[]) => Promise.all(filesPromise))
      // eslint-disable-next-line promise/no-callback-in-promise
      .then((files: FileUploadBuffer[]) => files.map((file: FileUploadBuffer) => callback(file)))
      .catch((error: Error) => {
        throw error;
      })
  );
};
