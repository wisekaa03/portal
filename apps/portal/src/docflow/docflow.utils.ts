/** @format */

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
} from '@lib/types/docflow';
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
  DocFlowTargetsSOAP,
  DocFlowFileVersionSOAP,
} from '@back/shared/types';
import { SOAP_DATE_NULL } from '@lib/types';
/** @format */

export const docFlowLegalPrivatePerson = (legal: DocFlowLegalPrivatePersonSOAP): DocFlowLegalPrivatePerson => ({
  id: legal.objectID?.id || '[legal:id]',
  name: legal.name || '[legal:name]',
  presentation: legal.objectID?.presentation,
  type: legal.objectID?.type || 'DMLegalPrivatePerson',
  navigationRef: legal.objectID?.navigationRef,
});

export const docFlowOrganization = (organization: DocFlowOrganizationSOAP): DocFlowOrganization => ({
  id: organization.objectID?.id || '[organization:id]',
  name: organization.name || '[organization:name]',
  fullName: organization.fullName || '[organization:fullName]',
  presentation: organization.objectID?.presentation,
  type: organization.objectID?.type || 'DMOrganization',
  navigationRef: organization.objectID?.navigationRef,
  legalPrivatePerson: organization.legalPrivatePerson && docFlowLegalPrivatePerson(organization.legalPrivatePerson),
  inn: organization.inn,
  kpp: organization.kpp,
  VATpayer: organization.VATpayer,
});

export const docFlowUser = (user: DocFlowUserSOAP): DocFlowUser => ({
  id: user.objectID?.id || '[user:id]',
  name: user.name || '[user:name]',
  presentation: user.objectID?.presentation,
  type: user.objectID?.type || 'DMUser',
  navigationRef: user.objectID?.navigationRef,
});

export const docFlowState = (state: DocFlowStateSOAP): DocFlowState => ({
  id: state.objectID?.id || '[state:id]',
  name: state.name || '[state:name]',
  presentation: state.objectID?.presentation || '[state:presentation]',
  navigationRef: state.objectID?.navigationRef,
  type: state.objectID?.type || 'DMBusinessProcessState', //
});

export const docFlowStatus = (state: DocFlowStatusSOAP): DocFlowStatus => ({
  id: state.objectID?.id || '[state:id]',
  name: state.name || '[state:name]',
  presentation: state.objectID?.presentation || '[state:presentation]',
  navigationRef: state.objectID?.navigationRef,
  type: state.objectID?.type || 'DMDocumentStatus', //
});

export const docFlowImportance = (importance: DocFlowImportanceSOAP): DocFlowImportance => ({
  id: importance.objectID.id || '[importance:id]',
  name: importance.name || '[importance:name]',
  // presentation: importance?.objectID?.presentation || '[state:presentation]',
});

export const docFlowParentTask = (parentTask: DocFlowProcessAcquaintanceSOAP): DocFlowParentTask => ({
  id: parentTask.objectID.id || '[parentTask:id]',
  name: parentTask.name || '[parentTask:name]',
  presentation: parentTask.objectID?.presentation || '[state:presentation]',
});

export const docFlowFileVersion = (fileVersion: DocFlowFileVersionSOAP): DocFlowFileVersion => ({
  id: fileVersion.objectID.id || '[fileVersion:id]',
  name: fileVersion.name || '[fileVersion:name]',
  presentation: fileVersion.objectID?.presentation || '[fileVersion:presentation]',
  navigationRef: fileVersion.objectID?.navigationRef || '[fileVersion:navigationRef]',
  type: fileVersion.objectID?.type || '[fileVersion:type]',
});

export const docFlowFile = (file: DocFlowFileSOAP): DocFlowFile => ({
  id: file.objectID.id || '[file:id]',
  name: file.name || '[file:name]',
  // presentation: file?.objectID.presentation,
  author: file.author && docFlowUser(file.author),
  encrypted: file.encrypted,
  signed: file.signed,
  description: file.description,
  activeVersion: file.activeVersion && docFlowFileVersion(file.activeVersion),
  binaryData: file.binaryData,
  extension: file.extension,
  modificationDateUniversal:
    file.modificationDateUniversal && file.modificationDateUniversal.toISOString() !== SOAP_DATE_NULL
      ? file.modificationDateUniversal
      : undefined,
  creationDate: file.creationDate && file.creationDate.toISOString() !== SOAP_DATE_NULL ? file.creationDate : undefined,
  size: file.size,
});

export const docFlowRole = (role: DocFlowRoleSOAP): DocFlowRole => ({
  id: role.objectID?.id || '[target:id]',
  name: role.name,
  presentation: role.objectID.presentation,
  type: role.objectID.type,
  navigationRef: role.objectID.navigationRef,
});

export const docFlowInternalDocument = (target: DocFlowInternalDocumentSOAP): DocFlowInternalDocument => ({
  id: target.objectID?.id || '[internalDocument:id]',
  name: target.name || '[internalDocument:name]',
  presentation: target.objectID.presentation,
  type: target.objectID.type,
  navigationRef: target.objectID.navigationRef,
  organization: target.organization && docFlowOrganization(target.organization),
  regDate: target.regDate && target.regDate.toISOString() !== SOAP_DATE_NULL ? target.regDate : undefined,
  author: target.author && docFlowUser(target.author),
  responsible: target.responsible && docFlowUser(target.responsible),
  files: target.files ? { object: target.files.map((file) => docFlowFile(file)) } : undefined,
});

export const docFlowTargets = (target: DocFlowTargetsSOAP): DocFlowTarget => ({
  name: target.name,
  role: docFlowRole(target.role),
  target: docFlowInternalDocument(target.target),
  allowDeletion: target?.allowDeletion ?? false,
});

export const docFlowTask = (task: DocFlowTaskSOAP): DocFlowTask => ({
  id: task.objectID?.id || '[task:id]',
  name: task.name || '[task:name]',
  presentation: task.objectID?.presentation,
  importance: task.importance ? docFlowImportance(task.importance) : undefined,
  executor: task.performer?.user ? docFlowUser(task.performer.user) : undefined,
  executed: task.executed ?? false,
  executionMark: task.executionMark,
  executionComment: task.executionComment,
  beginDate: task.beginDate && task.beginDate.toISOString() !== SOAP_DATE_NULL ? task.beginDate : undefined,
  dueDate: task.dueDate && task.dueDate.toISOString() !== SOAP_DATE_NULL ? task.dueDate : undefined,
  endDate: task.endDate && task.endDate.toISOString() !== SOAP_DATE_NULL ? task.endDate : undefined,
  description: task.description,
  processStep: task.businessProcessStep,
  changeRight: task.changeRight,
  performer: task.performer?.user && docFlowUser(task.performer.user),
  author: task.author && docFlowUser(task.author),
  accepted: task.accepted ?? false,
  acceptDate: task.acceptDate && task.acceptDate.toISOString() !== SOAP_DATE_NULL ? task.acceptDate : undefined,
  state: task.state && docFlowState(task.state),
  parentTask: task.parentBusinessProcess && docFlowParentTask(task.parentBusinessProcess),
  target: task.target && docFlowInternalDocument(task.target),
  targets: task.targets?.items?.map((t) => docFlowTargets(t)),
});
