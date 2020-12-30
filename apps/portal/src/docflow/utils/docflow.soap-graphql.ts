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
import { DocFlowOrganization } from '../graphql/DocFlowOrganization';
import { DocFlowSubdivision } from '../graphql/DocFlowSubdivision';
import { DocFlowLegalPrivatePerson } from '../graphql/DocFlowLegalPrivatePerson';
import { DocFlowVisa } from '../graphql/DocFlowVisa';
import { DocFlowFile } from '../graphql/DocFlowFile';
import { DocFlowFileVersion } from '../graphql/DocFlowFileVersion';

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

export const docFlowLegalPrivatePerson = (value: DocFlowLegalPrivatePersonSOAP): DocFlowLegalPrivatePerson => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  navigationRef: value.objectID.navigationRef,
  type: value.objectID.type,
});

export const docFlowOrganization = (value: DocFlowOrganizationSOAP): DocFlowOrganization => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  navigationRef: value.objectID.navigationRef,
  type: value.objectID.type,
  fullName: value.fullName,
  inn: value.inn,
  kpp: value.kpp,
  VATpayer: value.VATpayer,
  legalPrivatePerson: value.legalPrivatePerson ? docFlowLegalPrivatePerson(value.legalPrivatePerson) : undefined,
});

export const docFlowSubdivision = (value: DocFlowSubdivisionSOAP): DocFlowSubdivision => ({
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

export const docFlowVisa = (value: DocFlowVisaSOAP): DocFlowVisa => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  type: value.objectID.type,
  navigationRef: value.objectID.navigationRef,
  reviewer: value.reviewer ? docFlowUser(value.reviewer) : undefined,
  addedBy: value.addedBy ? docFlowUser(value.addedBy) : undefined,
  date: dateSOAP(value.date) || null,
  signed: value.signed,
  signatureChecked: value.signatureChecked,
  signatureValid: value.signatureValid,
  result: value.result ? docFlowApprovalResult(value.result) : undefined,
});

export const docFlowFileVersion = (value: DocFlowFileVersionSOAP): DocFlowFileVersion => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  type: value.objectID.type,
  navigationRef: value.objectID.navigationRef,
  author: value.author ? docFlowUser(value.author) : undefined,
  binaryData: value.binaryData,
  creationDate: dateSOAP(value.creationDate),
  encrypted: value.encrypted,
  extension: value.extension,
  modificationDate: dateSOAP(value.modificationDate),
  modificationDateUniversal: dateSOAP(value.modificationDateUniversal),
  signed: value.signed,
  size: value.size,
  text: value.text,
  comment: value.comment,
  owner: value.owner ? docFlowUser(value.owner) : undefined,
  deletionMark: value.deletionMark,
});

export const docFlowFile = (value: DocFlowFileSOAP, binaryData = false): DocFlowFile => {
  const file: DocFlowFile = {
    id: value.objectID.id,
    name: value.name,
    presentation: value.objectID.presentation,
    type: value.objectID.type,
    navigationRef: value.objectID.navigationRef,
    author: value.author ? docFlowUser(value.author) : undefined,
    creationDate: dateSOAP(value.creationDate),
    description: value.description,
    editing: value.editing,
    encrypted: value.encrypted,
    extension: value.extension,
    modificationDate: dateSOAP(value.modificationDate),
    modificationDateUniversal: dateSOAP(value.modificationDateUniversal),
    lockDate: dateSOAP(value.lockDate),
    signed: value.signed,
    size: value.size,
    text: value.text,
    owner: value.owner ? docFlowUser(value.owner) : undefined,
    editingUser: value.editingUser ? docFlowUser(value.editingUser) : undefined,
    deletionMark: value.deletionMark,
    activeVersion: value.activeVersion ? docFlowFileVersion(value.activeVersion) : undefined,
  };

  if (binaryData && value.binaryData) {
    file.binaryData = value.binaryData;
  }

  return file;
};

export const docFlowInternalDocument = (value: DocFlowInternalDocumentSOAP): DocFlowInternalDocument => ({
  id: value.objectID.id,
  name: value.name,
  presentation: value.objectID.presentation,
  navigationRef: value.objectID.navigationRef,
  type: value.objectID.type,

  openEnded: value.openEnded,
  organization: value.organization ? docFlowOrganization(value.organization) : undefined,
  regNumber: value.regNumber,
  statusChangeEnabled: value.statusChangeEnabled,
  statusEnabled: value.statusEnabled,
  status: value.status ? docFlowStatus(value.status) : undefined,
  statusApproval: value.statusApproval ? docFlowStatus(value.statusApproval) : undefined,
  statusPerformance: value.statusPerformance ? docFlowStatus(value.statusPerformance) : undefined,
  statusRegistration: value.statusRegistration ? docFlowStatus(value.statusRegistration) : undefined,
  regDate: dateSOAP(value.regDate),
  beginDate: dateSOAP(value.beginDate),
  author: value.author ? docFlowUser(value.author) : undefined,
  responsible: value.responsible ? docFlowUser(value.responsible) : undefined,
  subdivision: value.subdivision ? docFlowSubdivision(value.subdivision) : undefined,
  addressee: value.addressee ? docFlowUser(value.addressee) : undefined,
  title: value.title,
  summary: value.summary,
  files: value.files ? value.files.map((file) => docFlowFile(file)) : undefined,
  visas: value.visas ? value.visas.map((visa) => docFlowVisa(visa)) : undefined,
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
    targets:
      task.targets?.items && Array.isArray(task.targets.items) ? task.targets.items.map((value) => docFlowTargets(value)) : undefined,
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
