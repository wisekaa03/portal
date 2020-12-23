/** @format */

import type { FileUpload } from 'graphql-upload';

export interface FileUploadBuffer extends Pick<FileUpload, 'filename' | 'mimetype' | 'encoding'> {
  file: Buffer;
}
