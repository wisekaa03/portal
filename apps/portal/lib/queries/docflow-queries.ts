/** @format */

import { gql } from '@apollo/client';
import {
  DOCFLOW_TASK_FRAGMENT,
  DOCFLOW_FILE_FRAGMENT,
  DOCFLOW_TASKS_FRAGMENT,
  DOCFLOW_INTERNAL_DOCUMENT_FRAGMENT,
  DOCFLOW_TARGET_FRAGMENT,
  DOCFLOW_BPT_APPROVAL_TASK_APPROVAL,
  DOCFLOW_BPT_APPROVAL_TASK_CHECKUP,
  DOCFLOW_BPT_PERFORMANCE_TASK_CHECKUP,
  DOCFLOW_BPT_TASK,
  DOCFLOW_BPT_CONFIRMATION_TASK_CONFIRMATION,
} from './docflow-fragment';

export const DOCFLOW_TASKS = gql`
  query DocFlowTasks($tasks: DocFlowTasksInput) {
    docFlowTasks(tasks: $tasks) {
      ...TasksProps
    }
  }
  ${DOCFLOW_TASKS_FRAGMENT}
`;

export const DOCFLOW_TASKS_SUB = gql`
  subscription DocFlowTasksSubscription($tasks: DocFlowTasksInput) {
    docFlowTasksSubscription(tasks: $tasks) {
      ...TasksProps
    }
  }
  ${DOCFLOW_TASKS_FRAGMENT}
`;

export const DOCFLOW_FILE = gql`
  query DocFlowFile($file: DocFlowFileInput!) {
    docFlowFile(file: $file) {
      ...FileProps
      binaryData
    }
  }
  ${DOCFLOW_FILE_FRAGMENT}
`;

export const DOCFLOW_TASK = gql`
  query DocFlowTask($task: DocFlowTaskInput!) {
    docFlowTask(task: $task) {
      ...TaskApprovalTaskApproval
      ...TaskApprovalTaskCheckup
      ...TaskPerformanceTaskCheckup
      ...TaskConfirmationTaskConfirmation
      ...Task
    }
  }
  ${DOCFLOW_BPT_APPROVAL_TASK_APPROVAL}
  ${DOCFLOW_BPT_APPROVAL_TASK_CHECKUP}
  ${DOCFLOW_BPT_PERFORMANCE_TASK_CHECKUP}
  ${DOCFLOW_BPT_CONFIRMATION_TASK_CONFIRMATION}
  ${DOCFLOW_BPT_TASK}
`;

export const DOCFLOW_TASK_SUB = gql`
  subscription DocFlowTaskSubscription($task: DocFlowTaskInput!) {
    docFlowTaskSubscription(task: $task) {
      ...TaskProps
    }
  }
  ${DOCFLOW_TASK_FRAGMENT}
`;

export const DOCFLOW_INTERNAL_DOCUMENT = gql`
  query DocFlowInternalDocument($internalDocument: DocFlowInternalDocumentInput!) {
    docFlowInternalDocument(internalDocument: $internalDocument) {
      ...InternalDocumentProps
    }
  }
  ${DOCFLOW_INTERNAL_DOCUMENT_FRAGMENT}
`;

export const DOCFLOW_INTERNAL_DOCUMENT_SUB = gql`
  subscription DocFlowInternalDocument($internalDocument: DocFlowInternalDocumentSubInput!) {
    docFlowInternalDocument(internalDocument: $internalDocument) {
      ...InternalDocumentProps
    }
  }
  ${DOCFLOW_INTERNAL_DOCUMENT_FRAGMENT}
`;

export const DOCFLOW_CHANGE_PROCESS_STEP = gql`
  mutation DocFlowChangeProcessStep($taskID: ID!, $data: DocFlowDataInput!) {
    docFlowChangeProcessStep(taskID: $taskID, data: $data) {
      id
    }
  }
`;
