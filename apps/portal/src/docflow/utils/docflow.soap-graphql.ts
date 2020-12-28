/** @format */

import type { DataError } from '@lib/types/common';
import { DocFlowProcessStep, DocFlowTask } from '@lib/types/docflow';

import type {
  DocFlowFileSOAP,
  DocFlowBusinessProcessExecutorRoleSOAP,
  DocFlowBusinessProcessTaskSOAP,
  DocFlowStatusSOAP,
  DocFlowLegalPrivatePersonSOAP,
  DocFlowOrganizationSOAP,
  DocFlowUserSOAP,
  DocFlowStateSOAP,
  DocFlowImportanceSOAP,
  DocFlowProcessAcquaintanceSOAP,
  DocFlowInternalDocumentSOAP,
  DocFlowTargetSOAP,
  DocFlowFileVersionSOAP,
  DocFlowSubdivisionSOAP,
  DocFlowVisaSOAP,
  DocFlowApprovalResultSOAP,
  DocFlowProjectSOAP,
  DocFlowTasksSOAP,
  DocFlowBusinessProcessTaskExecutorSOAP,
  DocFlowBusinessProcessApprovalTaskCheckupApprovalResultSOAP,
  DocFlowBusinessProcessPerfomanceTaskCheckupResultSOAP,
} from '@back/shared/types';

import { dateSOAP } from '@back/shared/dateSOAP';

import { LoggerContext } from 'nestjs-ldap';
import { DocFlowBusinessProcessTask } from '../graphql/DocFlowBusinessProcessTask';
import { DocFlowBusinessProcessApprovalTaskApproval } from '../graphql/DocFlowBusinessProcessApprovalTaskApproval';
import { DocFlowBusinessProcessOrderTaskCheckup } from '../graphql/DocFlowBusinessProcessOrderTaskCheckup';
import { DocFlowBusinessProcessApprovalTaskCheckup } from '../graphql/DocFlowBusinessProcessApprovalTaskCheckup';
import { DocFlowBusinessProcessTaskImportance } from '../graphql/DocFlowBusinessProcessTaskImportance';
import { DocFlowUser } from '../graphql/DocFlowUser';
import { DocFlowInternalDocument } from '../graphql/DocFlowInternalDocument';
import { DocFlowBusinessProcessState } from '../graphql/DocFlowBusinessProcessState';
import { DocFlowProject } from '../graphql/DocFlowProject';
import { DocFlowBusinessProcessTarget } from '../graphql/DocFlowBusinessProcessTarget';
import { DocFlowBusinessProcessTargetRole } from '../graphql/DocFlowBusinessProcessTargetRole';
import { DocFlowDocumentStatus } from '../graphql/DocFlowDocumentStatus';
import { DocFlowApprovalResult } from '../graphql/DocFlowApprovalResult';
import { DocFlowTasks } from '../graphql/DocFlowTasks';
import { DocFlowBusinessProcessPerfomanceTaskCheckup } from '../graphql/DocFlowBusinessProcessPerfomanceTaskCheckup';
import { DocFlowBusinessProcessTaskExecutor } from '../graphql/DocFlowBusinessProcessTaskExecutor';
// eslint-disable-next-line max-len
import { DocFlowBusinessProcessApprovalTaskCheckupApprovalResult } from '../graphql/DocFlowBusinessProcessApprovalTaskCheckupApprovalResult';
import { DocFlowBusinessProcessPerfomanceTaskCheckupResult } from '../graphql/DocFlowBusinessProcessPerfomanceTaskCheckupResult';

export const docFlowProcessStepToEnum = (processStep?: string): DocFlowProcessStep | undefined => {
  switch (processStep) {
    case 'Ознакомиться с результатом согласования':
      return DocFlowProcessStep.CheckFamiliarize;
    case 'Проверить исполнение':
      return DocFlowProcessStep.CheckExecute;
    case 'Исполнить':
      return DocFlowProcessStep.Execute;
    case 'Ознакомиться':
      return DocFlowProcessStep.Familiarize;
    case 'Согласовать':
      return DocFlowProcessStep.Conform;
    case 'Утвердить':
      return DocFlowProcessStep.Approve;
    default:
  }

  return undefined;
};

export const docFlowProject = (value: DocFlowProjectSOAP): DocFlowProject => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  navigationRef: value.objectID.navigationRef,
  type: value.objectID.type,
});

export const docFlowUser = (value: DocFlowUserSOAP): DocFlowUser => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  navigationRef: value.objectID.navigationRef,
  type: value.objectID.type,
});

export const docFlowState = (value: DocFlowStateSOAP): DocFlowBusinessProcessState => ({
  id: value.objectID.id,
  name: value.name,
  type: value.objectID.type,
  presentation: value.objectID.presentation,
  navigationRef: value.objectID.navigationRef,
});

export const docFlowStatus = (value: DocFlowStatusSOAP): DocFlowDocumentStatus => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  navigationRef: value.objectID.navigationRef,
  type: value.objectID.type,
});

export const docFlowBusinessProcessImportance = (value: DocFlowImportanceSOAP): DocFlowBusinessProcessTaskImportance => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  navigationRef: value.objectID.navigationRef,
  type: value.objectID.type,
});

export const docFlowRole = (value: DocFlowBusinessProcessExecutorRoleSOAP): DocFlowBusinessProcessTargetRole => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  navigationRef: value.objectID.navigationRef,
  type: value.objectID.type,
});

export const docFlowApprovalResult = (value: DocFlowApprovalResultSOAP): DocFlowApprovalResult => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  type: value.objectID.type,
  navigationRef: value.objectID.navigationRef,
});
export const docFlowInternalDocument = (value: DocFlowInternalDocumentSOAP): DocFlowInternalDocument => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  navigationRef: value.objectID.navigationRef,
  type: value.objectID.type,

  // organization: value.organization ? docFlowOrganization(value.organization) : null,
  // regNumber: value.regNumber ?? null,
  // statusChangeEnabled: value.statusChangeEnabled ?? null,
  // statusEnabled: value.statusEnabled ?? null,
  // status: value.status ? docFlowStatus(value.status) : null,
  // statusApproval: value.statusApproval ? docFlowStatus(value.statusApproval) : null,
  // statusPerformance: value.statusPerformance ? docFlowStatus(value.statusPerformance) : null,
  // statusRegistration: value.statusRegistration ? docFlowStatus(value.statusRegistration) : null,
  // regDate: value.regDate && value.regDate.toISOString() !== SOAP_DATE_NULL ? value.regDate : null,
  // author: value.author ? docFlowUser(value.author) : null,
  // responsible: value.responsible ? docFlowUser(value.responsible) : null,
  // subdivision: value.subdivision ? docFlowSubdivision(value.subdivision) : null,
  // title: value.title ?? null,
  // summary: value.summary ?? null,
  // files: value.files ? { object: value.files.map((file) => docFlowFile(file)), error: null } : null,
  // visas: value.visas ? value.visas.map((visa) => docFlowVisa(visa)) : null,
});

export const docFlowTargets = (value: DocFlowTargetSOAP): DocFlowBusinessProcessTarget => ({
  name: value.name,
  role: docFlowRole(value.role),
  target: docFlowInternalDocument(value.target),
  allowDeletion: value?.allowDeletion ?? false,
});

export const docFlowBusinessProcessTaskExecutor = (value: DocFlowBusinessProcessTaskExecutorSOAP): DocFlowBusinessProcessTaskExecutor => ({
  user: value.user ? docFlowUser(value.user) : undefined,
  role: value.role ? docFlowRole(value.role) : undefined,
});

export const docFlowBusinessProcessApprovalTaskCheckupApprovalResult = (
  value: DocFlowBusinessProcessApprovalTaskCheckupApprovalResultSOAP,
): DocFlowBusinessProcessApprovalTaskCheckupApprovalResult => ({
  approvalResult: value.approvalResult ? docFlowApprovalResult(value.approvalResult) : undefined,
  approvalComment: value.approvalComment,
  approvalPerformer: value.approvalPerformer ? docFlowBusinessProcessTaskExecutor(value.approvalPerformer) : undefined,
  approvalDate: value.approvalDate,
});

export const docFlowBusinessProcessPerfomanceTaskCheckupResult = (
  value: DocFlowBusinessProcessPerfomanceTaskCheckupResultSOAP,
): DocFlowBusinessProcessPerfomanceTaskCheckupResult => ({
  returned: value.returned,
  checkComment: value.checkComment,
  executorTask: value.executorTask ? docFlowBusinessProcessTask(value.executorTask) : undefined,
});

export const docFlowBusinessProcessTask = (task: DocFlowBusinessProcessTaskSOAP): DocFlowTask => {
  const result: DocFlowTask = {
    id: task.objectID.id,
    name: task.name,
    type: task.objectID.type,
    presentation: task.objectID.presentation,
    navigationRef: task.objectID.navigationRef,

    importance: task.importance ? docFlowBusinessProcessImportance(task.importance) : undefined,
    performer: task.performer ? docFlowBusinessProcessTaskExecutor(task.performer) : undefined,

    executed: task.executed,
    executionMark: task.executionMark,

    beginDate: dateSOAP(task.beginDate),
    dueDate: dateSOAP(task.dueDate),
    endDate: dateSOAP(task.endDate),

    target: task.target ? docFlowInternalDocument(task.target) : undefined,

    description: task.description,
    // parentBusinessProcess: task.parentBusinessProcess && docFlowBusinessProcess(task.parentBusinessProcess),
    // businessProcesses:
    //   task.businessProcesses && Array.isArray(task.businessProcesses) && task.businessdocFlowBusinessProcess(task.businessProcesses),

    changeRight: task.changeRight,
    executionComment: task.executionComment,
    author: docFlowUser(task.author),
    accepted: task.accepted,
    acceptDate: dateSOAP(task.acceptDate),
    number: task.number,
    businessProcessStep: docFlowProcessStepToEnum(task.businessProcessStep),
    state: task.state ? docFlowState(task.state) : undefined,
    htmlView: task.htmlView,

    project: task.project ? docFlowProject(task.project) : undefined,
    targets: task.targets && Array.isArray(task.targets) ? task.targets.map((target) => docFlowTargets(target)) : undefined,
  };

  switch (task.objectID.type) {
    case 'DMBusinessProcessOrderTaskCheckup':
      (result as DocFlowBusinessProcessOrderTaskCheckup).iterationNumber = parseInt(task.iterationNumber || '0', 10);
      (result as DocFlowBusinessProcessOrderTaskCheckup).returned = task.returned;
      break;
    case 'DMBusinessProcessApprovalTaskApproval':
      (result as DocFlowBusinessProcessApprovalTaskApproval).iterationNumber = parseInt(task.iterationNumber || '0', 10);
      (result as DocFlowBusinessProcessApprovalTaskApproval).approvalResult =
        task.approvalResult && docFlowApprovalResult(task.approvalResult);
      break;
    case 'DMBusinessProcessPerfomanceTaskCheckup':
      (result as DocFlowBusinessProcessPerfomanceTaskCheckup).iterationNumber = parseInt(task.iterationNumber || '0', 10);
      (result as DocFlowBusinessProcessPerfomanceTaskCheckup).checkResults =
        task.checkResults && Array.isArray(task.checkResults) && task.checkResults.length > 0
          ? task.checkResults.map((value) => docFlowBusinessProcessPerfomanceTaskCheckupResult(value))
          : undefined;
      break;
    case 'DMBusinessProcessApprovalTaskCheckup':
      (result as DocFlowBusinessProcessApprovalTaskCheckup).iterationNumber = parseInt(task.iterationNumber || '0', 10);
      (result as DocFlowBusinessProcessApprovalTaskCheckup).approvalResult =
        task.approvalResult && docFlowApprovalResult(task.approvalResult);
      (result as DocFlowBusinessProcessApprovalTaskCheckup).approvalResults =
        task.approvalResults && Array.isArray(task.approvalResults) && task.approvalResults.length > 0
          ? task.approvalResults.map((value) => docFlowBusinessProcessApprovalTaskCheckupApprovalResult(value))
          : undefined;
      (result as DocFlowBusinessProcessApprovalTaskCheckup).returned = task.returned;
      break;
    case 'DMBusinessProcessTask':
    default:
  }

  return result;
};

export const docFlowBusinessProcessTasks = (values: DocFlowTasksSOAP[]): DocFlowTasks[] =>
  values.map((task) => ({
    canHaveChildren: task.canHaveChildren,
    isFolder: task.isFolder,
    task: docFlowBusinessProcessTask(task.object),
  }));

export const docFlowError = (result: DataError | undefined): Error | undefined => {
  if (result && result.attributes?.['xsi:type'] === 'm:DMError') {
    return new Error(__DEV__ ? result.subject : result.description);
  }

  return undefined;
};

export function docFlowData<T>(result: unknown): result is T {
  return !!(typeof result === 'object' && result !== null && (result as DataError)?.attributes?.['xsi:type'] !== 'm:DMError');
}
