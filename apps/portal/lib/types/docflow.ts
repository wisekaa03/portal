/** @format */

export interface DocFlowUser {
  id: string;
  name: string;
}

export interface DocFlowState {
  id: string;
  name: string;
}

export interface DocFlowFiles {
  id: string;
  name: string;
}

export interface DocFlowTask {
  id: string;
  name: string;
  importance?: string;
  executor?: DocFlowUser;
  executed?: boolean;
  executionMark?: string;
  beginDate?: Date;
  dueDate?: Date;
  endDate?: Date;
  files?: DocFlowFiles[];
  description?: string;
  parentTask?: DocFlowTask;
  processStep?: string;
  executionComment?: string;
  author: DocFlowUser;
  accepted?: boolean;
  acceptDate?: Date;
  state: DocFlowState;
}
