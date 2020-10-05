/** @format */

import { gql } from '@apollo/client';
import {
  DOCFLOW_TASK_FRAGMENT,
  DOCFLOW_FILE_FRAGMENT,
  DOCFLOW_INTERNAL_DOCUMENT_FRAGMENT,
  DOCFLOW_TARGET_FRAGMENT,
} from './docflow-fragment';

export const DOCFLOW_TASKS = gql`
  query DocFlowTasks($tasks: DocFlowTasksInput) {
    docFlowTasks(tasks: $tasks) {
      ...TaskProps
    }
  }
  ${DOCFLOW_TASK_FRAGMENT}
`;

export const DOCFLOW_TASKS_SUB = gql`
  subscription DocFlowTasks($tasks: DocFlowTasksInput) {
    docFlowTasks(tasks: $tasks) {
      ...TaskProps
    }
  }
  ${DOCFLOW_TASK_FRAGMENT}
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
      ...TaskProps
    }
  }
  ${DOCFLOW_TASK_FRAGMENT}
`;

export const DOCFLOW_TASK_SUB = gql`
  subscription DocFlowTask($task: DocFlowTaskInput!) {
    docFlowTask(task: $task) {
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
  subscription DocFlowInternalDocument($internalDocument: DocFlowInternalDocumentInput!) {
    docFlowInternalDocument(internalDocument: $internalDocument) {
      ...InternalDocumentProps
    }
  }
  ${DOCFLOW_INTERNAL_DOCUMENT_FRAGMENT}
`;
