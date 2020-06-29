/** @format */

import { FileDetails } from 'nextcloud-link/compiled/source/types';

export interface FilesFile {
  path: string;
  temporaryFile?: string;
}

export interface FilesOptions {
  sync?: boolean;
}

export enum Folder {
  FILES,
  DIRECTORY,
}

export interface FilesFolder extends Omit<FileDetails, 'isDirectory' | 'isFile' | 'href' | 'type'> {
  type: Folder;
}
