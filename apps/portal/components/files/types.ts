/** @format */

import { Files } from '@app/portal/files/models/files.dto';
import { FilesFolder } from '@app/portal/files/models/files.folder.dto';
import { DropzoneFile } from '../dropzone/types';

// export interface MediaComponentProps {
//   loading: boolean;
//   current?: MediaQueryProps;
//   data: MediaQueryProps[];
//   handleCurrent: (_: MediaQueryProps) => () => void;
//   handleCloseCurrent: () => void;
//   handleDelete: (_: MediaQueryProps) => () => void;
// }

export interface FilesComponentProps {
  fileLoading: boolean;
  folderLoading: boolean;
  fileData?: FilesQueryProps[];
  folderData?: FilesFolder[];
  folderName: string;
  setFolderName: React.Dispatch<React.SetStateAction<string>>;
  handleCreateFolder: (_: string) => void;
  showDropzone: boolean;
  handleOpenDropzone: () => void;
  attachments: DropzoneFile[];
  setAttachments: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  handleUploadFile: () => void;
}

export interface FilesTreeComponentProps {
  data?: FilesFolder[];
  item: string;
  setItem: React.Dispatch<React.SetStateAction<string>>;
  handleCreateItem: (_: string) => void;
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
  name?: string;
  childs: FilesFolderTreeVirtual[];
};
