/** @format */

import type { DataError } from '@lib/types/common';
import type {
  DocFlowTask,
  DocFlowLegalPrivatePerson,
  DocFlowOrganization,
  DocFlowUser,
  DocFlowState,
  DocFlowStatus,
  DocFlowImportance,
  DocFlowParentTask,
  DocFlowInternalDocument,
  DocFlowTarget,
  DocFlowFile,
  DocFlowFiles,
  DocFlowRole,
  DocFlowFileVersion,
  DocFlowSubdivision,
  DocFlowVisa,
  DocFlowApprovalResult,
} from '@lib/types/docflow';
import { DocFlowProcessStep } from '@lib/types/docflow';
import type {
  DocFlowFileSOAP,
  DocFlowRoleSOAP,
  DocFlowTaskSOAP,
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
} from '@back/shared/types';
import { SOAP_DATE_NULL } from '@lib/types';
/** @format */

export const docFlowLegalPrivatePerson = (legal: DocFlowLegalPrivatePersonSOAP): DocFlowLegalPrivatePerson => ({
  id: legal.objectID?.id || '[legal:id]',
  name: legal.name || '[legal:name]',
  presentation: legal.objectID?.presentation ?? null,
  navigationRef: legal.objectID?.navigationRef ?? null,
  type: legal.objectID?.type ?? null,
});

export const docFlowOrganization = (organization: DocFlowOrganizationSOAP): DocFlowOrganization => ({
  id: organization.objectID?.id || '[organization:id]',
  name: organization.name || '[organization:name]',
  fullName: organization.fullName ?? null,
  presentation: organization.objectID?.presentation ?? null,
  type: organization.objectID?.type ?? null,
  navigationRef: organization.objectID?.navigationRef ?? null,
  legalPrivatePerson: organization.legalPrivatePerson ? docFlowLegalPrivatePerson(organization.legalPrivatePerson) : null,
  inn: organization.inn ?? null,
  kpp: organization.kpp ?? null,
  VATpayer: organization.VATpayer ?? null,
});

export const docFlowSubdivision = (subdivision: DocFlowSubdivisionSOAP): DocFlowSubdivision => ({
  id: subdivision.objectID?.id || '[organization:id]',
  name: subdivision.name || '[organization:name]',
  presentation: subdivision.objectID?.presentation ?? null,
  type: subdivision.objectID?.type ?? null,
  navigationRef: subdivision.objectID?.navigationRef ?? null,
});

export const docFlowUser = (user: DocFlowUserSOAP): DocFlowUser => ({
  id: user.objectID?.id || '[user:id]',
  name: user.name || '[user:name]',
  presentation: user.objectID?.presentation ?? null,
  navigationRef: user.objectID?.navigationRef ?? null,
  type: user.objectID?.type ?? null,
});

export const docFlowState = (state: DocFlowStateSOAP): DocFlowState => ({
  id: state.objectID?.id || '[state:id]',
  name: state.name || '[state:name]',
  presentation: state.objectID?.presentation ?? null,
  navigationRef: state.objectID?.navigationRef ?? null,
  type: state.objectID?.type ?? null,
});

export const docFlowStatus = (state: DocFlowStatusSOAP): DocFlowStatus => ({
  id: state.objectID?.id || '[state:id]',
  name: state.name || '[state:name]',
  presentation: state.objectID?.presentation ?? null,
  navigationRef: state.objectID?.navigationRef ?? null,
  type: state.objectID?.type ?? null,
});

export const docFlowImportance = (importance: DocFlowImportanceSOAP): DocFlowImportance => ({
  id: importance.objectID.id || '[importance:id]',
  name: importance.name || '[importance:name]',
  presentation: importance?.objectID?.presentation ?? null,
  navigationRef: importance.objectID?.navigationRef ?? null,
  type: importance.objectID?.type ?? null,
});

export const docFlowParentTask = (parentTask: DocFlowProcessAcquaintanceSOAP): DocFlowParentTask => ({
  id: parentTask.objectID.id || '[parentTask:id]',
  name: parentTask.name || '[parentTask:name]',
  presentation: parentTask.objectID?.presentation ?? null,
  navigationRef: parentTask.objectID?.navigationRef ?? null,
  type: parentTask.objectID?.type ?? null,
  author: parentTask.author ? docFlowUser(parentTask.author) : null,
  beginDate: parentTask.beginDate && parentTask.beginDate.toISOString() !== SOAP_DATE_NULL ? parentTask.beginDate : null,
  dueDate: parentTask.dueDate && parentTask.dueDate.toISOString() !== SOAP_DATE_NULL ? parentTask.dueDate : null,
  blockedByTemplate: parentTask.blockedByTemplate ?? null,
  completed: parentTask.completed ?? null,
  dueTimeEnabled: parentTask.dueTimeEnabled ?? null,
  executionComment: parentTask.executionComment ?? null,
  description: parentTask.description ?? null,
  importance: parentTask.importance ? docFlowImportance(parentTask.importance) : null,
  leadingTaskEnabled: parentTask.leadingTaskEnabled ?? null,
  parentTaskEnabled: parentTask.parentTaskEnabled ?? null,
  started: parentTask.started ?? null,
  stateEnabled: parentTask.stateEnabled ?? null,
  performers: parentTask.performers ? parentTask.performers.map((user) => docFlowUser(user)) : null,
  state: parentTask.state ? docFlowState(parentTask.state) : null,
  target: parentTask.target ? docFlowInternalDocument(parentTask.target) : null,
  targets: parentTask.targets && parentTask.targets.items ? parentTask.targets.items.map((t) => docFlowTargets(t)) : null,
});

export const docFlowFileVersion = (fileVersion: DocFlowFileVersionSOAP): DocFlowFileVersion => ({
  id: fileVersion.objectID.id || '[fileVersion:id]',
  name: fileVersion.name || '[fileVersion:name]',
  presentation: fileVersion.objectID?.presentation ?? null,
  navigationRef: fileVersion.objectID?.navigationRef ?? null,
  type: fileVersion.objectID?.type ?? null,
});

export const docFlowFile = (file: DocFlowFileSOAP): DocFlowFile => ({
  id: file.objectID.id || '[file:id]',
  name: file.name || '[file:name]',
  // presentation: file?.objectID.presentation,
  author: file.author ? docFlowUser(file.author) : null,
  encrypted: file.encrypted ?? null,
  signed: file.signed ?? null,
  description: file.description ?? null,
  activeVersion: file.activeVersion ? docFlowFileVersion(file.activeVersion) : null,
  binaryData: file.binaryData ?? null,
  extension: file.extension ?? null,
  editing: file.editing ?? null,
  editingUser: file.editingUser ? docFlowUser(file.editingUser) : null,
  modificationDateUniversal:
    file.modificationDateUniversal && file.modificationDateUniversal.toISOString() !== SOAP_DATE_NULL
      ? file.modificationDateUniversal
      : null,
  creationDate: file.creationDate && file.creationDate.toISOString() !== SOAP_DATE_NULL ? file.creationDate : null,
  size: file.size ?? null,
  type: file.objectID.type ?? null,
});

export const docFlowRole = (role: DocFlowRoleSOAP): DocFlowRole => ({
  id: role.objectID?.id || '[role:id]',
  name: role.name,
  presentation: role.objectID.presentation ?? null,
  type: role.objectID.type ?? null,
  navigationRef: role.objectID.navigationRef ?? null,
});

export const docFlowApprovalResult = (approvalResult: DocFlowApprovalResultSOAP): DocFlowApprovalResult => ({
  id: approvalResult.objectID?.id || '[approvalResult:id]',
  name: approvalResult.name ?? null,
  presentation: approvalResult.objectID.presentation ?? null,
  type: approvalResult.objectID.type ?? null,
  navigationRef: approvalResult.objectID.navigationRef ?? null,
});

export const docFlowVisa = (visa: DocFlowVisaSOAP): DocFlowVisa => ({
  id: visa.objectID?.id || '[visa:id]',
  name: visa.name ?? null,
  presentation: visa.objectID.presentation ?? null,
  type: visa.objectID.type ?? null,
  navigationRef: visa.objectID.navigationRef ?? null,
  addedBy: visa.addedBy ? docFlowUser(visa.addedBy) : null,
  reviewer: visa.reviewer ? docFlowUser(visa.reviewer) : null,
  comment: visa.comment ?? null,
  date: visa.date && visa.date.toISOString() !== SOAP_DATE_NULL ? visa.date : null,
  result: visa.result ? docFlowApprovalResult(visa.result) : null,
  signatureChecked: visa.signatureChecked ?? null,
  signatureValid: visa.signatureValid ?? null,
  signed: visa.signed ?? null,
});

export const docFlowInternalDocument = (target: DocFlowInternalDocumentSOAP): DocFlowInternalDocument => ({
  id: target.objectID?.id || '[internalDocument:id]',
  name: target.name || '[internalDocument:name]',
  presentation: target.objectID.presentation ?? null,
  type: target.objectID.type ?? null,
  navigationRef: target.objectID.navigationRef ?? null,
  organization: target.organization ? docFlowOrganization(target.organization) : null,
  regNumber: target.regNumber ?? null,
  statusChangeEnabled: target.statusChangeEnabled ?? null,
  statusEnabled: target.statusEnabled ?? null,
  status: target.status ? docFlowStatus(target.status) : null,
  statusApproval: target.statusApproval ? docFlowStatus(target.statusApproval) : null,
  statusPerformance: target.statusPerformance ? docFlowStatus(target.statusPerformance) : null,
  statusRegistration: target.statusRegistration ? docFlowStatus(target.statusRegistration) : null,
  regDate: target.regDate && target.regDate.toISOString() !== SOAP_DATE_NULL ? target.regDate : null,
  author: target.author ? docFlowUser(target.author) : null,
  responsible: target.responsible ? docFlowUser(target.responsible) : null,
  subdivision: target.subdivision ? docFlowSubdivision(target.subdivision) : null,
  title: target.title ?? null,
  summary: target.summary ?? null,
  files: target.files ? { object: target.files.map((file) => docFlowFile(file)), error: null } : null,
  visas: target.visas ? target.visas.map((visa) => docFlowVisa(visa)) : null,
});

export const docFlowTargets = (target: DocFlowTargetSOAP): DocFlowTarget => ({
  name: target.name,
  role: docFlowRole(target.role),
  target: docFlowInternalDocument(target.target),
  allowDeletion: target?.allowDeletion ?? false,
});

export const docFlowProcessStep = (processStep?: string): DocFlowProcessStep | null => {
  switch (processStep) {
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

  return null;
};

export const docFlowTask = (task: DocFlowTaskSOAP): DocFlowTask => ({
  id: task.objectID?.id || '[task:id]',
  name: task.name || '[task:name]',
  presentation: task.objectID?.presentation ?? null,
  importance: task.importance ? docFlowImportance(task.importance) : null,
  executed: task.executed ?? false,
  executionMark: task.executionMark ?? null,
  executionComment: task.executionComment ?? null,
  beginDate: task.beginDate && task.beginDate.toISOString() !== SOAP_DATE_NULL ? task.beginDate : null,
  dueDate: task.dueDate && task.dueDate.toISOString() !== SOAP_DATE_NULL ? task.dueDate : null,
  endDate: task.endDate && task.endDate.toISOString() !== SOAP_DATE_NULL ? task.endDate : null,
  description: task.description ?? null,
  processStep: docFlowProcessStep(task.businessProcessStep),
  changeRight: task.changeRight ?? null,
  performer: task.performer && task.performer.user ? docFlowUser(task.performer.user) : null,
  author: task.author ? docFlowUser(task.author) : null,
  accepted: task.accepted ?? false,
  acceptDate: task.acceptDate && task.acceptDate.toISOString() !== SOAP_DATE_NULL ? task.acceptDate : null,
  state: task.state ? docFlowState(task.state) : null,
  parentTask: task.parentBusinessProcess ? docFlowParentTask(task.parentBusinessProcess) : null,
  target: task.target ? docFlowInternalDocument(task.target) : null,
  targets: task.targets && task.targets.items ? task.targets.items.map((t) => docFlowTargets(t)) : null,
  htmlView: task.htmlView ?? null,
  number: task.number ?? null,
});

export const docFlowError = (result: DataError | undefined): Error | undefined => {
  if (result && result.attributes?.['xsi:type'] === 'm:DMError') {
    return new Error(__DEV__ ? result.subject : result.description);
  }

  return undefined;
};

export function docFlowData<T>(result: unknown): result is T {
  return !!(typeof result === 'object' && result !== null && (result as DataError)?.attributes?.['xsi:type'] !== 'm:DMError');
}
