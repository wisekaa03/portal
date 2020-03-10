/** @format */

import { Files } from '@app/portal/files/models/files.dto';
import { FilesFolder } from '@app/portal/files/models/files.folder.dto';
import { DropzoneFile } from '../dropzone/types';

export interface FilesComponentProps {
  loading: boolean;
  current?: FilesQueryProps;
  data: FilesQueryProps[];
  handleCurrent: (_: FilesQueryProps) => () => void;
  handleCloseCurrent: () => void;
  handleDelete: (_: FilesQueryProps) => () => void;
}

export interface FilesEditComponentProps {
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

export interface FilesQueryProps {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  file: string;
  content: Buffer;
}

export type FilesFolderTreeVirtual = {
  id: string;
  childs: FilesFolderTreeVirtual[];
};
