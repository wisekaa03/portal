/** @format */

import type React from 'react';
import type { TFunction } from 'next-i18next';
import type { GraphQLQueryInput } from '@back/shared/types';

export interface DocFlowTasksColumn {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value?: number | Date) => string;
}

export interface DocFlowTasksTableProps {
  t: TFunction;
  classes: Record<string, string>;
  columns: DocFlowTasksColumn[];
  tasks: DocFlowTask[];
  page: number;
  rowsPerPage: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface DocFlowTasksComponentProps {
  loading: boolean;
  tasks: DocFlowTask[];
  status: string;
  find: string;
  handleSearch: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatus: (_: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface DocFlowUser {
  id: string;
  name: string;
  presentation?: string;
  type?: string;
  navigationRef?: string;
}

export interface DocFlowState {
  id: string;
  name?: string;
  presentation?: string;
}

export interface DocFlowInternalDocument {
  id: string;
  name?: string;
  presentation?: string;
  type?: string;
  navigationRef?: string;
}

export interface DocFlowRole {
  name?: string;
  id: string;
  presentation?: string;
  type?: string; // DMBusinessProcessTargetRole
  navigationRef?: string;
}

export interface DocFlowTarget {
  name: string;
  role: DocFlowRole;
  target: DocFlowInternalDocument;
  allowDeletion?: boolean;
  files?: DocFlowFiles;
}

export interface DocFlowFile {
  id: string;
  name?: string;
}

export interface DocFlowImportance {
  id: string;
  name?: string;
  presentation?: string;
}

export interface DocFlowParentTask {
  id: string;
  name?: string;
  presentation?: string;
}

export interface DocFlowFiles {
  object?: DocFlowFile[];
  error?: string[];
}

export interface DocFlowTask {
  id: string;
  name?: string;
  presentation?: string;
  importance?: DocFlowImportance;
  executor?: DocFlowUser;
  executed?: boolean;
  executionMark?: string;
  executionComment?: string;
  beginDate?: Date;
  dueDate?: Date;
  endDate?: Date;
  description?: string;
  processStep?: string;
  author: DocFlowUser;
  accepted?: boolean;
  acceptDate?: Date;
  state?: DocFlowState;
  parentTask?: DocFlowParentTask;
  target?: DocFlowInternalDocument;
  targets?: DocFlowTarget[];
  files?: DocFlowFiles | Promise<DocFlowFiles>;
}

/* DocFlow input fields */

export type DocFlowUserInput = GraphQLQueryInput;
export type DocFlowTasksInput = GraphQLQueryInput;
export type DocFlowTaskInput = GraphQLQueryInput;

export interface DocFlowTargetInput extends GraphQLQueryInput {
  objectID: string;
}

export interface DocFlowFileInput extends GraphQLQueryInput {
  file: string;
}
