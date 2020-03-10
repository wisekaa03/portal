/** @format */

import { Files } from '@app/portal/files/models/files.dto';
import { FilesFolder } from '@app/portal/files/models/files.folder.dto';
import { DropzoneFile } from '../dropzone/types';

export interface MediaComponentProps {
  loading: boolean;
  current?: MediaQueryProps;
  data: MediaQueryProps[];
  handleCurrent: (_: MediaQueryProps) => () => void;
  handleCloseCurrent: () => void;
  handleDelete: (_: MediaQueryProps) => () => void;
}

export interface MediaEditComponentProps {
  loading: boolean;
  foldersLoading: boolean;
  folderData?: FilesFolder[];
  current?: Files;
  folder: string;
  setFolder: React.Dispatch<React.SetStateAction<string>>;
  handleCreateFolder: (_: string) => void;
  attachments: DropzoneFile[];
  setAttachments: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  handleUpload: () => void;
}

export interface MediaQueryProps {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  file: string;
  content: Buffer;
}

export type MediaFolderTreeVirtual = {
  id: string;
  childs: MediaFolderTreeVirtual[];
};
