/** @format */

import type React from 'react';
import type { Order } from 'typeorm-graphql-pagination';

import { FilesFolder } from '@back/files/graphql/FilesFolder';
import { FilesFolderChk } from '@back/files/graphql/FilesFolderChk';
import { FilesFile } from '@back/files/graphql/FilesFile';

export interface FilesComponentProps {
  folderLoading: boolean;
  folderData?: FilesFolderChk[];
  search: string;
  path: FilesPath[];
  handleCheckbox: (current: number | FilesFolderChk[]) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  handleDrop: (acceptedFiles: File[]) => Promise<void>;
  handleFolder: (filesFolder: string | FilesFolderChk) => void;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: (filesFolder: FilesFolderChk) => () => void;
  handleUrl: () => void;
  handleUpload: () => void;
  handleDelete: (filesFolder?: FilesFolderChk) => () => void;
}

export interface FilesTreeComponentProps {
  data?: FilesFolder[];
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
  data: FilesFolderChk[];
  search: string;
  filesColumns: FilesColumn[];
  path: FilesPath[];
  handleCheckbox: (current: number | FilesFolderChk[]) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  handleDrop: (acceptedFiles: File[]) => Promise<void>;
  handleFolder: (filesFolder: string | FilesFolderChk) => void;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownload: (filesFolder: FilesFolderChk) => () => void;
  handleUrl: () => void;
  handleUpload: () => void;
  handleDelete: (filesFolder?: FilesFolderChk) => () => void;
};

export interface FilesBreadcrumbsProps {
  path: FilesPath[];
  handleFolder: (filesFolder: string | FilesFolderChk) => void;
  handleUrl: () => void;
  handleUpload: () => void;
  handleDelete: (filesFolder?: FilesFolderChk) => () => void;
}

export interface FilesBreadcrumbsLastProps {
  handleUrl: () => void;
  handleUpload: () => void;
  handleDelete: (filesFolder?: FilesFolderChk) => () => void;
}

export type FilesPath = string;

export type FilesColumnNames = 'checked' | 'id' | 'type' | 'name' | 'mime' | 'lastModified' | 'size';

export type FilesColumn = {
  label: FilesColumnNames;
  hidden: boolean;
  files?: FilesFile;
  width?: number;
  colspan?: number;
  align?: string;
};

export type FilesTableHeaderProps = {
  header: FilesColumn[];
  handleCheckbox: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
};

export type FilesTableRowProps = {
  header: FilesColumn[];
  current: FilesFolderChk;
  index: number;
  handleCheckbox: (current: number) => (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  handleRow: (event: React.MouseEvent<HTMLTableCellElement, MouseEvent>, current: FilesFolderChk) => void;
};

export interface FilesHeaderContextProps {
  columns: FilesColumnNames[];
  orderBy: Order<FilesColumnNames>;
}
