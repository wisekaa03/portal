/** @format */

import { Media } from '@app/portal/media/models/media.dto';
import { MediaFolder } from '@app/portal/media/models/media.folder.dto';
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
  folderData?: MediaFolder[];
  current?: Media;
  newFolder: string;
  setNewFolder: React.Dispatch<React.SetStateAction<string>>;
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
