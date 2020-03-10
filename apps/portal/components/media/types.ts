/** @format */

import { Media } from '@app/portal/media/models/media.dto';
import { MediaFolder } from '@app/portal/media/models/media.folder.dto';
import { DropzoneFile } from '../dropzone/types';

// export interface MediaComponentProps {
//   loading: boolean;
//   current?: MediaQueryProps;
//   data: MediaQueryProps[];
//   handleCurrent: (_: MediaQueryProps) => () => void;
//   handleCloseCurrent: () => void;
//   handleDelete: (_: MediaQueryProps) => () => void;
// }

export interface MediaComponentProps {
  fileLoading: boolean;
  folderLoading: boolean;
  fileData?: FileQueryProps[];
  folderData?: MediaFolder[];
  folderName: string;
  setFolderName: React.Dispatch<React.SetStateAction<string>>;
  handleCreateFolder: (_: string) => void;
  attachments: DropzoneFile[];
  setAttachments: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  handleUploadFile: () => void;
}

export interface MediaTreeComponentProps {
  data?: MediaFolder[];
  item: string;
  setItem: React.Dispatch<React.SetStateAction<string>>;
  handleCreateItem: (_: string) => void;
}

export interface FileQueryProps {
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
