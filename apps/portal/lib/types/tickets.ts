/** @format */

import type React from 'react';

import { TkUser } from '@back/tickets/graphql/TkUser';
import { TkTask } from '@back/tickets/graphql/TkTask';
import { TkFile } from '@back/tickets/graphql/TkFile';

import type { DropzoneFile } from './dropzone';

export interface TasksComponentProps {
  loading: boolean;
  tasks: (TkTask | null)[];
  status: string;
  find: string;
  handleSearch: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatus: (_: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface TasksCardProps {
  classes: Record<'root' | 'content' | 'label' | 'registered' | 'worked', string>;
  task: TkTask;
}

export interface TaskFilesAreaProps {
  task: TkTask;
  loading: boolean;
  handleDownload: (task: TkTask, file: TkFile) => void;
  classes: Record<string, string>;
}

export interface TaskComponentProps {
  loading: boolean;
  loadingTaskFile: boolean;
  loadingComment: boolean;
  task: TkTask | null;
  comment: string;
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  handleDownload: (task: TkTask, file: TkFile) => void;
  handleComment: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleAccept: () => void;
  handleClose: () => void;
}

export interface TaskInfoCardProps {
  classes: Record<'root' | 'center' | 'content' | 'avatar' | 'list', string>;
  header: string;
  // TODO: !!! STRING THERE !!!
  profile?: TkUser | string;
}
