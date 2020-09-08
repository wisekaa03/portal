/** @format */

import React from 'react';
import { WithTranslation } from 'next-i18next';
import { ApolloQueryResult, ApolloError, QueryLazyOptions } from '@apollo/client';
import { TkUser, TkTask, TkTasks, TkFileInput, TkFile, TkWhere } from './tickets';
import { StyleProps as StyleProperties, Data } from './common';
import { DropzoneFile } from './dropzone';

export interface TasksComponentProps {
  loading: boolean;
  tasks: (TkTask | null)[];
  status: string;
  search: string;
  tasksRefetch: () => Promise<ApolloQueryResult<Data<'TicketsTasks', TkTasks>>>;
  handleSearch: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatus: (_: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface TasksCardProps {
  classes: Record<'root' | 'content' | 'label' | 'registered' | 'worked', string>;
  task: TkTask;
}

export interface TaskComponentProps {
  loading: boolean;
  loadingEdit: boolean;
  task?: TkTask;
  comment: string;
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  taskFile: (options?: QueryLazyOptions<TkFileInput> | undefined) => void;
  taskFileLoading: boolean;
  taskFileData?: Data<'TicketsTaskFile', TkFile>;
  taskFileError?: ApolloError;
  commentFile: (options?: QueryLazyOptions<TkFileInput> | undefined) => void;
  commentFileLoading: boolean;
  commentFileData?: Data<'TicketsCommentFile', TkFile>;
  commentFileError?: ApolloError;
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
