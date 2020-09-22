/** @format */

import type React from 'react';
import { TFunction } from 'next-i18next';

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

export interface DocFlowFile {
  id: string;
  name?: string;
  presentation?: string;
  allowDeletion: boolean;
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
  files?: DocFlowFile[];
}

export interface DocFlowUserInput {
  cache?: boolean;
}

export interface DocFlowTasksInput {
  cache?: boolean;
}

export interface DocFlowTaskInput {
  cache?: boolean;
}

export interface DocFlowFileInput {
  documentID: string;
  cache?: boolean;
}

export interface DocFlowFileSOAP {
  allowDeletion: boolean;
  name: string;
  role: {
    name: string;
    objectID: {
      id: string;
      navigationRef: string;
      presentation: string;
      type: 'DMBusinessProcessTargetRole';
    };
  };
  target: {
    name: string;
    objectID: {
      id: string;
      navigationRef: string;
      presentation: string;
      type: 'DMInternalDocument';
    };
  };
}

export interface DocFlowUserSOAP {
  name?: string;
  objectID?: {
    id?: string;
    navigationRef?: string;
    presentation?: string;
    type?: 'DMUser';
  };
}

export interface DocFlowImportanceSOAP {
  name?: string;
  objectID: {
    id?: string;
    presentation?: string;
    type?: 'DMBusinessProcessTaskImportance';
  };
}

export interface DocFlowProcessAcquaintanceSOAP {
  name?: string;
  objectID: {
    id?: string;
    navigationRef?: string;
    presentation?: string;
    type?: 'DMBusinessProcessAcquaintance';
  };
}

export interface DocFlowStateSOAP {
  name?: string;
  objectID?: {
    id?: string;
    navigationRef?: string;
    presentation?: string;
    type?: 'DMBusinessProcessState';
  };
}

export interface DocFlowInternalDocumentSOAP {
  name?: string;
  objectID?: {
    id?: string;
    navigationRef?: string;
    presentation?: string;
    type?: 'DMInternalDocument';
  };
}

export interface DocFlowTaskSOAP {
  canHaveChildren?: boolean;
  isFolder?: boolean;
  object: {
    name?: string;
    acceptDate?: Date;
    accepted?: boolean;
    attributes?: {
      'xsi:type'?: 'm:DMBusinessProcessTask';
    };
    author?: DocFlowUserSOAP;
    beginDate?: Date;
    businessProcessStep?: string;
    changeRight?: boolean;
    description?: string;
    dueDate?: Date;
    endDate?: Date;
    executed?: boolean;
    executionComment?: string;
    executionMark?: string;
    importance?: DocFlowImportanceSOAP;
    objectID?: {
      id?: string;
      navigationRef?: string;
      presentation?: string;
      type?: 'DMBusinessProcessTask';
    };
    parentBusinessProcess?: DocFlowProcessAcquaintanceSOAP;
    performer?: {
      user?: DocFlowUserSOAP;
    };
    state?: DocFlowStateSOAP;
    target?: DocFlowInternalDocumentSOAP;
    targets?: {
      items?: DocFlowFileSOAP[];
    };
  };
}

export interface DocFlowTasksSOAP {
  items: DocFlowTaskSOAP[];
}
