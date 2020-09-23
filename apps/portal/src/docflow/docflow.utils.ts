/** @format */

import type {
  DocFlowTask,
  DocFlowUser,
  DocFlowState,
  DocFlowImportance,
  DocFlowParentTask,
  DocFlowTarget,
  DocFlowFile,
} from '@lib/types/docflow';
import type {
  DocFlowTaskSOAP,
  DocFlowUserSOAP,
  DocFlowStateSOAP,
  DocFlowImportanceSOAP,
  DocFlowProcessAcquaintanceSOAP,
  DocFlowTargetSOAP,
  DocFlowFileVersionSOAP,
} from '@back/shared/types';
import { SOAP_DATE_NULL } from '@lib/types/common';
/** @format */

export const docFlowUser = (user?: DocFlowUserSOAP): DocFlowUser => ({
  id: user?.objectID?.id || '[user:id]',
  name: user?.name || '[user:name]',
  presentation: user?.objectID?.presentation,
  type: user?.objectID?.type || 'DMUser',
  navigationRef: user?.objectID?.navigationRef,
});

export const docFlowState = (state?: DocFlowStateSOAP): DocFlowState => ({
  id: state?.objectID?.id || '[state:id]',
  name: state?.name || '[state:name]',
  presentation: state?.objectID?.presentation || '[state:presentation]',
});

export const docFlowImportance = (importance?: DocFlowImportanceSOAP): DocFlowImportance => ({
  id: importance?.objectID.id || '[importance:id]',
  name: importance?.name || '[importance:name]',
  presentation: importance?.objectID?.presentation || '[state:presentation]',
});

export const docFlowParentTask = (parentTask?: DocFlowProcessAcquaintanceSOAP): DocFlowParentTask => ({
  id: parentTask?.objectID.id || '[parentTask:id]',
  name: parentTask?.name || '[parentTask:name]',
  presentation: parentTask?.objectID?.presentation || '[state:presentation]',
});

export const docFlowFiles = (file?: DocFlowFileVersionSOAP): DocFlowFile => ({
  id: file?.objectID.id || '[file:id]',
  name: file?.name || '[file:name]',
  presentation: file?.objectID.presentation || '[file:presentation]',
  // allowDeletion: file?.allowDeletion ?? false,
});

export const docFlowTarget = (target: DocFlowTargetSOAP): DocFlowTarget => ({
  id: target.objectID?.id || '[target:id]',
  presentation: target.objectID.presentation,
  type: target.objectID.type,
  navigationRef: target.objectID.navigationRef,
});

export const docFlowTask = (task: DocFlowTaskSOAP): DocFlowTask => ({
  id: task.object.objectID?.id || '[task:id]',
  name: task.object.name || '[task:name]',
  presentation: task.object.objectID?.presentation,
  importance: task.object.importance ? docFlowImportance(task.object.importance) : undefined,
  executor: task.object.performer?.user ? docFlowUser(task.object.performer.user) : undefined,
  executed: task.object.executed ?? false,
  executionMark: task.object.executionMark,
  executionComment: task.object.executionComment,
  beginDate: task.object.beginDate && task.object.beginDate.toISOString() !== SOAP_DATE_NULL ? task.object.beginDate : undefined,
  dueDate: task.object.dueDate && task.object.dueDate.toISOString() !== SOAP_DATE_NULL ? task.object.dueDate : undefined,
  endDate: task.object.endDate && task.object.endDate.toISOString() !== SOAP_DATE_NULL ? task.object.endDate : undefined,
  description: task.object.description,
  processStep: task.object.businessProcessStep,
  author: docFlowUser(task.object.author),
  accepted: task.object.accepted ?? false,
  acceptDate: task.object.acceptDate && task.object.acceptDate.toISOString() !== SOAP_DATE_NULL ? task.object.acceptDate : undefined,
  state: docFlowState(task.object.state),
  parentTask: docFlowParentTask(task.object.parentBusinessProcess),
  // target: docFlowTarget(task.object.target),
  // files: task.object.targets?.items?.map((file) => docFlowFiles(file)),
});
