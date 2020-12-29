/** @format */

import type React from 'react';
import type { I18n, TFunction } from 'next-i18next';

import type { DocFlowUser } from '@back/docflow/graphql/DocFlowUser';
import type { DocFlowInternalDocument } from '@back/docflow/graphql/DocFlowInternalDocument';
import type { DocFlowBusinessProcessTask } from '@back/docflow/graphql/DocFlowBusinessProcessTask';
import type { DocFlowBusinessProcessOrderTaskCheckup } from '@back/docflow/graphql/DocFlowBusinessProcessOrderTaskCheckup';
import type { DocFlowBusinessProcessApprovalTaskApproval } from '@back/docflow/graphql/DocFlowBusinessProcessApprovalTaskApproval';
import type { DocFlowBusinessProcessPerfomanceTaskCheckup } from '@back/docflow/graphql/DocFlowBusinessProcessPerfomanceTaskCheckup';
import type { DocFlowBusinessProcessApprovalTaskCheckup } from '@back/docflow/graphql/DocFlowBusinessProcessApprovalTaskCheckup';
import type { DocFlowTasks } from '@back/docflow/graphql/DocFlowTasks';

import type { PortalErrorsProps } from './errors';

export type { DocFlowTasks } from '@back/docflow/graphql/DocFlowTasks';

export type DocFlowTask =
  | DocFlowBusinessProcessTask
  | DocFlowBusinessProcessOrderTaskCheckup
  | DocFlowBusinessProcessApprovalTaskApproval
  | DocFlowBusinessProcessPerfomanceTaskCheckup
  | DocFlowBusinessProcessApprovalTaskCheckup;

export enum DocFlowProcessStep {
  CheckExecute = 'CheckExecute' /* Проверить исполнение */,
  Execute = 'Execute' /* Исполнить */,
  Familiarize = 'Familiarize' /* Ознакомиться */,
  CheckFamiliarize = 'CheckFamiliarize' /* Ознакомиться с результатом согласования */,
  Conform = 'Conform' /* Согласовать */,
  NotConform = 'NotConform' /* Не согласовано */,
  ConformWithComments = 'ConformWithComments' /* Согласовать с комментариями */,
  Approve = 'Approve' /* Утвердить */,
  NotApprove = 'NotApprove' /* Не утвердить */,
}

export enum DocFlowExecutionMark {
  NotExecuted = 'NotExecuted',
  Stopped = 'Stopped',
  Interrupted = 'Interrupted',
  ReadyToStart = 'ReadyToStart',
  StartCanceled = 'StartCanceled',
  ExecutedNeutral = 'ExecutedNeutral',
  ExecutedNegative = 'ExecutedNegative',
  ExecutedAlmostPositive = 'ExecutedAlmostPositive',
  ExecutedPositive = 'ExecutedPositive',
  ReadyToExecute = 'ReadyToExecute',
  ExecutionCanceled = 'ExecutionCanceled',
}

export interface DocFlowData {
  processStep?: DocFlowProcessStep;
  comments?: string;
  endDate?: Date | null;
}

export interface DocFlowFileProps {
  task: DocFlowBusinessProcessTask;
  loading: boolean;
  handleDownload: (file: any /* DocFlowFile */) => void;
  i18n: I18n;
  t: TFunction;
  classes: Record<string, string>;
}

export interface DocFlowTasksColumn {
  id: string; // keyof DocFlowTask;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value?: number | Date) => string;
}

export interface DocFlowTasksTableProps {
  t: TFunction;
  classes: Record<string, string>;
  columns: DocFlowTasksColumn[];
  tasks: DocFlowTasks[];
  page: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface DocFlowTasksComponentProps extends PortalErrorsProps {
  loading: boolean;
  tasks: DocFlowTasks[];
  status: string;
  find: string;
  handleSearch: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatus: (_: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface DocFlowTaskComponentProps extends PortalErrorsProps {
  loading: boolean;
  loadingFile: boolean;
  loadingProcessStep: boolean;
  task?: DocFlowTask;
  comments: string;
  endDate: Date | null;
  handleEndDate?: (date: Date | null | undefined, keyboardInputValue?: string | undefined) => void;
  handleDownload: (file: any /* DocFlowFile */) => void;
  handleComments: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  handleProcessStep: (step: DocFlowProcessStep, taskID?: string, data?: DocFlowData) => void;
}

export interface DocFlowTaskInfoCardProps {
  classes: Record<'root' | 'center' | 'content' | 'avatar' | 'list', string>;
  header: string;
  profile: DocFlowUser | string | null;
}

export interface DocFlowInternalDocumentComponentProps extends PortalErrorsProps {
  loading: boolean;
  internalDocument?: DocFlowInternalDocument;
}

export interface DocFlowProcessStepProps extends PortalErrorsProps {
  loading: boolean;
  endDate: Date | null;
  handleEndDate?: (date: Date | null | undefined, keyboardInputValue?: string | undefined) => void;
  handleProcessStep: (step: DocFlowProcessStep, taskID?: string, data?: DocFlowData) => void;
  task: DocFlowBusinessProcessTask;
}
