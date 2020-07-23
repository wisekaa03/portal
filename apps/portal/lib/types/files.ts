/** @format */

import React from 'react';
import { ApolloQueryResult } from '@apollo/client';
import { FilesFolder } from './files.interface';
import { Data } from './common';
import { Order } from 'typeorm-graphql-pagination';

export interface FilesComponentProps {
  folderLoading: boolean;
  folderData?: FilesFolder[];
  folderRefetch: () => void;
  search: string;
  path: FilesPath[];
  handleCheckbox: (current?: FilesFolder) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  handleDrop: (acceptedFiles: File[]) => Promise<void>;
  handleFolder: (filesFolder: FilesFolder) => void;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: (filesFolder: FilesFolder) => () => void;
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

export type FilesTableProps = {
  data: FilesFolder[];
  folderRefetch: () => void;
  search: string;
  filesColumns: FilesColumn[];
  path: FilesPath[];
  handleCheckbox: (current?: FilesFolder) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  handleDrop: (acceptedFiles: File[]) => Promise<void>;
  handleFolder: (filesFolder: FilesFolder | string) => void;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: (filesFolder: FilesFolder) => () => void;
  handleDelete: (filesFolder: FilesFolder) => () => void;
};

export type FilesPath = string;

export type FilesColumnNames = 'id' | 'type' | 'name' | 'mime' | 'lastModified' | 'size';

export type FilesColumn = {
  label: FilesColumnNames;
  hidden: boolean;
  width?: number;
  colspan?: number;
  align?: string;
};

export type FilesTableHeaderProps = {
  header: FilesColumn[];
  handleCheckbox: (current?: FilesFolder) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
};

export type FilesTableRowProps = {
  header: FilesColumn[];
  current: FilesFolder;
  handleCheckbox: (current?: FilesFolder) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  handleRow: (event: React.MouseEvent<HTMLTableCellElement, MouseEvent>, current: FilesFolder) => void;
};

export interface FilesHeaderContextProps {
  columns: FilesColumnNames[];
  orderBy: Order<FilesColumnNames>;
}
