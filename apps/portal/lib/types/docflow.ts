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

export interface DocFlowTaskComponentProps {
  loading: boolean;
  task?: DocFlowTask;
  handleDownload: (task: DocFlowTask, file: DocFlowFile) => void;
}

export interface DocFlowTaskInfoCardProps {
  classes: Record<'root' | 'center' | 'content' | 'avatar' | 'list', string>;
  header: string;
  profile: DocFlowUser | string | null;
}

export interface DocFlowTargetComponentProps {
  loading: boolean;
  target?: DocFlowTarget;
}

export interface DocFlowLegalPrivatePerson {
  id: string;
  name: string | null;
  presentation: string | null;
  type: string | null;
  navigationRef: string | null;
}

export interface DocFlowOrganization {
  id: string;
  name: string | null;
  presentation: string | null;
  navigationRef: string | null;
  type: string | null;
  fullName: string | null;
  inn: string | null;
  kpp: string | null;
  VATpayer: boolean | null;
  legalPrivatePerson: DocFlowLegalPrivatePerson | null;
}

export interface DocFlowUser {
  id: string;
  name: string;
  presentation: string | null;
  type: string | null;
  navigationRef: string | null;
}

export interface DocFlowStatus {
  id: string;
  name: string | null;
  presentation: string | null;
  type: string | null;
  navigationRef: string | null;
}

export interface DocFlowState {
  id: string;
  name: string | null;
  presentation: string | null;
  type: string | null;
  navigationRef: string | null;
}

export interface DocFlowInternalDocument {
  id: string;
  name: string | null;
  presentation: string | null;
  type: string | null;
  navigationRef: string | null;
  organization: DocFlowOrganization | null;
  author: DocFlowUser | null;
  regDate: Date | null;
  responsible: DocFlowUser | null;
  regNumber: string | null;
  status: DocFlowStatus | null;
  files: DocFlowFiles | null;
}

export interface DocFlowRole {
  name: string | null;
  id: string;
  presentation: string | null;
  type: string | null; // DMBusinessProcessTargetRole
  navigationRef: string | null;
}

export interface DocFlowTarget {
  name: string;
  role: DocFlowRole;
  target: DocFlowInternalDocument;
  allowDeletion: boolean | null;
}

export interface DocFlowInternalFile {
  name: string;
}

export interface DocFlowFileVersion {
  id: string | null;
  name: string | null;
  presentation: string | null;
  navigationRef: string | null;
  type: string | null;
}

export interface DocFlowFile {
  id: string;
  name: string | null;
  author: DocFlowUser | null;
  encrypted: boolean | null;
  signed: boolean | null;
  description: string | null;
  editing: boolean | null;
  editingUser: DocFlowUser | null;
  activeVersion: DocFlowFileVersion | null;
  binaryData: string | null;
  extension: string | null;
  creationDate: Date | null;
  modificationDateUniversal: Date | null;
  size: number | null;
  type: string | null;
}

export interface DocFlowImportance {
  id: string;
  name: string | null;
  presentation: string | null;
  navigationRef: string | null;
  type: string | null;
}

export interface DocFlowParentTask {
  id: string;
  name: string | null;
  presentation: string | null;
  navigationRef: string | null;
  type: string | null;
  author: DocFlowUser | null;
  beginDate: Date | null;
  blockedByTemplate: boolean | null;
  completed: boolean | null;
  description: string | null;
  dueDate: Date | null;
  dueTimeEnabled: boolean | null;
  executionComment: string | null;
  importance: DocFlowImportance | null;
  leadingTaskEnabled: boolean | null;
  parentTaskEnabled: boolean | null;
  performers: DocFlowUser[] | null;
  started: boolean | null;
  state: DocFlowState | null;
  stateEnabled: boolean | null;
  target: DocFlowInternalDocument | null;
  targets: DocFlowTarget[] | null;
}

export interface DocFlowFiles {
  object: DocFlowFile[] | null;
  error: string[] | null;
}

export interface DocFlowTask {
  id: string;
  name: string | null;
  presentation: string | null;
  importance: DocFlowImportance | null;
  executed: boolean | null;
  executionMark: string | null;
  executionComment: string | null;
  beginDate: Date | null;
  dueDate: Date | null;
  endDate: Date | null;
  changeRight: boolean | null;
  description: string | null;
  processStep: string | null;
  htmlView: string | null;
  number: string | null;
  author: DocFlowUser | null;
  performer: DocFlowUser | null;
  accepted: boolean | null;
  acceptDate: Date | null;
  state: DocFlowState | null;
  parentTask: DocFlowParentTask | null;
  target: DocFlowInternalDocument | null;
  targets: DocFlowTarget[] | null;
}

/* DocFlow input fields */

export type DocFlowUserInput = GraphQLQueryInput;
export type DocFlowTasksInput = GraphQLQueryInput;
export interface DocFlowTaskInput extends GraphQLQueryInput {
  id: string;
}

export interface DocFlowTargetInput extends GraphQLQueryInput {
  id: string;
}

export interface DocFlowFileInput extends GraphQLQueryInput {
  id: string;
}
