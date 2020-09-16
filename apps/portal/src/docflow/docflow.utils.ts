/** @format */

import type {
  DocFlowTaskSOAP,
  DocFlowTask,
  DocFlowUserSOAP,
  DocFlowUser,
  DocFlowStateSOAP,
  DocFlowState,
  DocFlowImportance,
  DocFlowImportanceSOAP,
  DocFlowProcessAcquaintanceSOAP,
  DocFlowParentTask,
  DocFlowFileSOAP,
  DocFlowFile,
} from '@lib/types/docflow';
import { SOAP_DATE_NULL } from '@lib/types/common';
/** @format */

export const docFlowUser = (user?: DocFlowUserSOAP): DocFlowUser => ({
  id: user?.objectID?.id || '[user:id]',
  name: user?.objectID?.presentation || '[user:name]',
});

export const docFlowState = (state?: DocFlowStateSOAP): DocFlowState => ({
  id: state?.objectID?.id || '[state:id]',
  name: state?.objectID?.presentation || '[state:name]',
});

export const docFlowImportance = (importance?: DocFlowImportanceSOAP): DocFlowImportance => ({
  id: importance?.objectID.id || '[importance:id]',
  name: importance?.name || '[importance:name]',
});

export const docFlowParentTask = (parentTask?: DocFlowProcessAcquaintanceSOAP): DocFlowParentTask => ({
  id: parentTask?.objectID.id || '[parentTask:id]',
  name: parentTask?.name || '[parentTask:name]',
});

export const docFlowFiles = (file?: DocFlowFileSOAP): DocFlowFile => ({
  id: file?.target.objectID.id || '[file:id]',
  name: file?.name || '[file:name]',
  presentation: file?.target.objectID.presentation || '[file:presentation]',
  allowDeletion: file?.allowDeletion ?? false,
});

export const docFlowTask = (task: DocFlowTaskSOAP): DocFlowTask => ({
  id: task.object.objectID?.id || '[task:id]',
  name: task.object.objectID?.presentation || '[task:name]',
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
  files: task.object.targets?.items?.map((file) => docFlowFiles(file)),
});
