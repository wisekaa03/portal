/** @format */

import { DropzoneFile } from './dropzone';
import { FilesFolder } from './files.interface';

export interface FilesComponentProps {
  folderLoading: boolean;
  folderData?: FilesFolder[];
  setPath: React.Dispatch<React.SetStateAction<string>>;
  folderRefetch: () => void;
  search: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: () => void;
  handleDelete: (filesFolder: FilesFolder) => () => void;
  // folderName: string;
  // setFolderName: React.Dispatch<React.SetStateAction<string>>;
  // showDropzone: boolean;
  // handleOpenDropzone: () => void;
  // handleCloseDropzone: () => void;
  // handleEditFolder: (_: string, __: number, ___?: string) => void;
  // openFolderDialog: number;
  // folderDialogName: string;
  // handleFolderDialogName: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  // handleAcceptFolderDialog: (_: number) => void;
  // handleCloseFolderDialog: () => void;
  // attachments: DropzoneFile[];
  // setAttachments: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  // handleUploadFile: () => void;
}

export interface FilesTreeComponentProps {
  data?: FilesFolder[];
  // item: string;
  // handleEdit: (_: string, __: number, ___?: string) => void;
  // setItem: React.Dispatch<React.SetStateAction<string>>;
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
  data: FilesFolder[];
  refetchData: () => void;
  search: string;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: () => void;
  handleDelete: (filesFolder: FilesFolder) => () => void;
};

export type FilesTableHeaderProps = {
  label: string;
  hidden: boolean;
  width?: number;
  colspan?: number;
};

export const FilesFolderListHeaderLabels: FilesTableHeaderProps[] = [
  { label: 'id', colspan: 1, hidden: true },
  { label: 'type', colspan: 1, hidden: true },
  { label: 'name', colspan: 2, hidden: false },
  { label: 'mime', width: 100, colspan: 1, hidden: false },
  // { label: 'creationDate', width: 200, colspan: 1, hidden: false },
  { label: 'lastModified', width: 200, colspan: 1, hidden: false },
  { label: 'size', width: 150, colspan: 1, hidden: false },
];
