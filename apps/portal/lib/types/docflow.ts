/** @format */

export interface DocFlowUser {
  id: string;
  name: string;
}

export interface DocFlowState {
  id: string;
  name: string;
}

export interface DocFlowFile {
  id: string;
  name: string;
  presentation: string;
  allowDeletion: boolean;
}

export interface DocFlowImportance {
  id: string;
  name: string;
}

export interface DocFlowParentTask {
  id: string;
  name: string;
}

export interface DocFlowTask {
  id: string;
  name: string;
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
