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
  FILE = 'FILE',
  FOLDER = 'FOLDER',
}

export interface FilesFolder extends Omit<FileDetails, 'isDirectory' | 'isFile' | 'href' | 'type'> {
  id: string;
  fileId: string;
  type: Folder;
  mime: string;
  etag: string;
  permissions: string;
  favorite: number;
  hasPreview: boolean;
  commentsUnread: number;
  commentsCount: number;
  ownerId: string;
  ownerDisplayName: string;
  // resourceType?: string;
  // shareTypes?: string;
}
