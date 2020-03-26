/** @format */

import { FilesFolder } from './files.folder.dto';
import { DropzoneFile } from './dropzone';

export interface FilesComponentProps {
  fileLoading: boolean;
  folderLoading: boolean;
  fileData?: FilesQueryProps[];
  folderData?: FilesFolder[];
  folderName: string;
  setFolderName: React.Dispatch<React.SetStateAction<string>>;
  fileRefetch: () => void;
  showDropzone: boolean;
  handleOpenDropzone: () => void;
  handleCloseDropzone: () => void;
  handleEditFolder: (_: string, __: number, ___?: string) => void;
  openFolderDialog: number;
  folderDialogName: string;
  handleFolderDialogName: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAcceptFolderDialog: (_: number) => void;
  handleCloseFolderDialog: () => void;
  attachments: DropzoneFile[];
  setAttachments: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  handleUploadFile: () => void;
  search: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: () => void;
  handleDelete: () => void;
}

export interface FilesTreeComponentProps {
  data?: FilesFolder[];
  item: string;
  handleEdit: (_: string, __: number, ___?: string) => void;
  setItem: React.Dispatch<React.SetStateAction<string>>;
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
  id?: string;
  name: string;
  pathname: string;
  childs: FilesFolderTreeVirtual[];
};

export type FilesDialogComponentProps = {
  open: number;
  input: string;
  handleAccept: (_: number) => void;
  handleInput: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleClose: () => void;
};

export type FolderDialogState = {
  id?: string;
  pathname: string;
  oldName?: string;
  name: string;
};

export type FilesTableComponentProps = {
  data?: FilesQueryProps[];
  refetchData: () => void;
  search: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: () => void;
  handleDelete: () => void;
};

export type FilesTableHeaderProps = {
  label: string;
  width?: number;
};
