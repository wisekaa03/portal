/** @format */

import type React from 'react';
import { TFunction } from 'next-i18next';

export interface DocFlowInternalDocumentSOAP {
  name?: string;
  objectID: {
    id?: string;
    presentation?: string;
    type?: string; // DMInternalDocument
    navigationRef?: string;
  };
}

export interface DocFlowRoleSOAP {
  name: string;
  objectID: {
    id: string;
    navigationRef?: string;
    presentation?: string;
    type?: string; // 'DMBusinessProcessTargetRole';
  };
}

export interface DocFlowTargetsSOAP {
  allowDeletion: boolean;
  name: string;
  role: DocFlowRoleSOAP;
  target: DocFlowInternalDocumentSOAP;
}

export interface DocFlowFileVersionSOAP {
  name?: string;
  objectID: {
    id: string;
    presentation?: string;
    navigationRef?: string;
    type?: string; // 'DMFileVersion'
  };
}

export interface DocFlowFileSOAP {
  name?: string;
  activeVersion?: DocFlowFileVersionSOAP;
  attributes?: string;
  binaryData?: string;
  extension?: string;
  modificationDateUniversal?: Date;
  size?: number;
  objectID: {
    id: string;
    presentation?: string;
    navigationRef?: string;
    type?: string; // 'DMFile'
  };
}

export interface DocFlowFileListSOAP {
  name?: string;
  objectID: {
    id: string;
    type?: string; // 'DMFile'
  };
  author?: DocFlowUserSOAP;
  creationDate?: Date;
  description?: string;
  editing?: boolean;
  encrypted?: boolean;
  extension?: string;
  modificationDateUniversal?: Date;
  signed?: boolean;
  size?: number;
  activeVersion?: DocFlowFileVersionSOAP;
}

export interface DocFlowUserSOAP {
  name?: string;
  objectID?: {
    id?: string;
    navigationRef?: string;
    presentation?: string;
    type?: string; // 'DMUser';
  };
}

export interface DocFlowImportanceSOAP {
  name?: string;
  objectID: {
    id?: string;
    presentation?: string;
    type?: string; // 'DMBusinessProcessTaskImportance';
  };
}

export interface DocFlowProcessAcquaintanceSOAP {
  name?: string;
  objectID: {
    id?: string;
    navigationRef?: string;
    presentation?: string;
    type?: string; // 'DMBusinessProcessAcquaintance';
  };
}

export interface DocFlowStateSOAP {
  name?: string;
  objectID?: {
    id?: string;
    navigationRef?: string;
    presentation?: string;
    type?: string; // 'DMBusinessProcessState';
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
      type?: string; // 'DMBusinessProcessTask';
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
      type?: string; // 'DMBusinessProcessTask';
    };
    parentBusinessProcess?: DocFlowProcessAcquaintanceSOAP;
    performer?: {
      user?: DocFlowUserSOAP;
    };
    state?: DocFlowStateSOAP;
    target?: DocFlowInternalDocumentSOAP;
    targets?: {
      items?: DocFlowTargetsSOAP[];
    };
  };
}
