/** @format */

import type { DataError } from '@lib/types/common';
import { DocFlowProcessStep, DocFlowTask } from '@lib/types/docflow';

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
  DocFlowProjectSOAP,
  DocFlowTasksSOAP,
} from '@back/shared/types';

import { dateSOAP } from '@back/shared/dateSOAP';

import { LoggerContext } from 'nestjs-ldap';
import { DocFlowBusinessProcessTask } from '../graphql/DocFlowBusinessProcessTask';
import { DocFlowBusinessProcessApprovalTaskApproval } from '../graphql/DocFlowBusinessProcessApprovalTaskApproval';
import { DocFlowBusinessProcessOrderTaskCheckup } from '../graphql/DocFlowBusinessProcessOrderTaskCheckup';
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

export const docFlowProject = (legal: DocFlowProjectSOAP): DocFlowProject => ({
  id: legal.objectID.id,
  name: legal.name,
  presentation: legal.objectID.presentation,
  navigationRef: legal.objectID.navigationRef,
  type: legal.objectID.type,
});

// export const docFlowLegalPrivatePerson = (legal: DocFlowLegalPrivatePersonSOAP): DocFlowLegalPrivatePerson => ({
//   id: legal.objectID?.id || '[legal:id]',
//   name: legal.name || '[legal:name]',
//   presentation: legal.objectID?.presentation ?? null,
//   navigationRef: legal.objectID?.navigationRef ?? null,
//   type: legal.objectID?.type ?? null,
// });

// export const docFlowOrganization = (organization: DocFlowOrganizationSOAP): DocFlowOrganization => ({
//   id: organization.objectID?.id || '[organization:id]',
//   name: organization.name || '[organization:name]',
//   fullName: organization.fullName ?? null,
//   presentation: organization.objectID?.presentation ?? null,
//   type: organization.objectID?.type ?? null,
//   navigationRef: organization.objectID?.navigationRef ?? null,
//   legalPrivatePerson: organization.legalPrivatePerson ? docFlowLegalPrivatePerson(organization.legalPrivatePerson) : null,
//   inn: organization.inn ?? null,
//   kpp: organization.kpp ?? null,
//   VATpayer: organization.VATpayer ?? null,
// });

// export const docFlowSubdivision = (subdivision: DocFlowSubdivisionSOAP): DocFlowSubdivision => ({
//   id: subdivision.objectID?.id || '[organization:id]',
//   name: subdivision.name || '[organization:name]',
//   presentation: subdivision.objectID?.presentation ?? null,
//   type: subdivision.objectID?.type ?? null,
//   navigationRef: subdivision.objectID?.navigationRef ?? null,
// });

export const docFlowUser = (user: DocFlowUserSOAP): DocFlowUser => ({
  id: user.objectID.id,
  name: user.name,
  presentation: user.objectID.presentation,
  navigationRef: user.objectID.navigationRef,
  type: user.objectID.type,
});

export const docFlowState = (state: DocFlowStateSOAP): DocFlowBusinessProcessState => ({
  id: state.objectID.id,
  name: state.name,
  type: state.objectID.type,
  presentation: state.objectID.presentation,
  navigationRef: state.objectID.navigationRef,
});

export const docFlowStatus = (state: DocFlowStatusSOAP): DocFlowDocumentStatus => ({
  id: state.objectID.id,
  name: state.name,
  presentation: state.objectID.presentation,
  navigationRef: state.objectID.navigationRef,
  type: state.objectID.type,
});

export const docFlowImportance = (importance: DocFlowImportanceSOAP): DocFlowBusinessProcessTaskImportance => ({
  id: importance.objectID.id,
  name: importance.name,
  type: importance.objectID.type,
});

// export const docFlowParentTask = (parentTask: DocFlowProcessAcquaintanceSOAP): DocFlowParentTask => ({
//   id: parentTask.objectID.id,
//   name: parentTask.name,
//   presentation: parentTask.objectID.presentation,
//   navigationRef: parentTask.objectID.navigationRef,
//   type: parentTask.objectID.type,
//   // author: parentTask.author ? docFlowUser(parentTask.author) : null,
//   // beginDate: parentTask.beginDate && parentTask.beginDate.toISOString() !== SOAP_DATE_NULL ? parentTask.beginDate : null,
//   // dueDate: parentTask.dueDate && parentTask.dueDate.toISOString() !== SOAP_DATE_NULL ? parentTask.dueDate : null,
//   // blockedByTemplate: parentTask.blockedByTemplate ?? null,
//   // completed: parentTask.completed ?? null,
//   // dueTimeEnabled: parentTask.dueTimeEnabled ?? null,
//   // executionComment: parentTask.executionComment ?? null,
//   // description: parentTask.description ?? null,
//   // importance: parentTask.importance ? docFlowImportance(parentTask.importance) : null,
//   // leadingTaskEnabled: parentTask.leadingTaskEnabled ?? null,
//   // parentTaskEnabled: parentTask.parentTaskEnabled ?? null,
//   // started: parentTask.started ?? null,
//   // stateEnabled: parentTask.stateEnabled ?? null,
//   // performers: parentTask.performers ? parentTask.performers.map((user) => docFlowUser(user)) : null,
//   // state: parentTask.state ? docFlowState(parentTask.state) : null,
//   // target: parentTask.target ? docFlowInternalDocument(parentTask.target) : null,
//   // targets: parentTask.targets && parentTask.targets.items ? parentTask.targets.items.map((t) => docFlowTargets(t)) : null,
// });

// export const docFlowFileVersion = (fileVersion: DocFlowFileVersionSOAP): DocFlowFileVersion => ({
//   id: fileVersion.objectID.id || '[fileVersion:id]',
//   name: fileVersion.name || '[fileVersion:name]',
//   presentation: fileVersion.objectID?.presentation ?? null,
//   navigationRef: fileVersion.objectID?.navigationRef ?? null,
//   type: fileVersion.objectID?.type ?? null,
// });

// export const docFlowFile = (file: DocFlowFileSOAP): DocFlowFile => ({
//   id: file.objectID.id || '[file:id]',
//   name: file.name || '[file:name]',
//   // presentation: file?.objectID.presentation,
//   author: file.author ? docFlowUser(file.author) : null,
//   encrypted: file.encrypted ?? null,
//   signed: file.signed ?? null,
//   description: file.description ?? null,
//   activeVersion: file.activeVersion ? docFlowFileVersion(file.activeVersion) : null,
//   binaryData: file.binaryData ?? null,
//   extension: file.extension ?? null,
//   editing: file.editing ?? null,
//   editingUser: file.editingUser ? docFlowUser(file.editingUser) : null,
//   modificationDateUniversal:
//     file.modificationDateUniversal && file.modificationDateUniversal.toISOString() !== SOAP_DATE_NULL
//       ? file.modificationDateUniversal
//       : null,
//   creationDate: file.creationDate && file.creationDate.toISOString() !== SOAP_DATE_NULL ? file.creationDate : null,
//   size: file.size ?? null,
//   type: file.objectID.type ?? null,
// });

export const docFlowRole = (role: DocFlowRoleSOAP): DocFlowBusinessProcessTargetRole => ({
  id: role.objectID.id,
  name: role.name,
  presentation: role.objectID.presentation,
  navigationRef: role.objectID.navigationRef,
  type: role.objectID.type,
});

export const docFlowApprovalResult = (approvalResult: DocFlowApprovalResultSOAP): DocFlowApprovalResult => ({
  id: approvalResult.objectID.id,
  name: approvalResult.name,
  presentation: approvalResult.objectID.presentation,
  type: approvalResult.objectID.type,
  navigationRef: approvalResult.objectID.navigationRef,
});

// export const docFlowVisa = (visa: DocFlowVisaSOAP): DocFlowVisa => ({
//   id: visa.objectID?.id || '[visa:id]',
//   name: visa.name ?? null,
//   presentation: visa.objectID.presentation ?? null,
//   type: visa.objectID.type ?? null,
//   navigationRef: visa.objectID.navigationRef ?? null,
//   addedBy: visa.addedBy ? docFlowUser(visa.addedBy) : null,
//   reviewer: visa.reviewer ? docFlowUser(visa.reviewer) : null,
//   comment: visa.comment ?? null,
//   date: visa.date && visa.date.toISOString() !== SOAP_DATE_NULL ? visa.date : null,
//   result: visa.result ? docFlowApprovalResult(visa.result) : null,
//   signatureChecked: visa.signatureChecked ?? null,
//   signatureValid: visa.signatureValid ?? null,
//   signed: visa.signed ?? null,
// });

export const docFlowInternalDocument = (target: DocFlowInternalDocumentSOAP): DocFlowInternalDocument => ({
  id: target.objectID.id,
  name: target.name,
  presentation: target.objectID.presentation,
  navigationRef: target.objectID.navigationRef,
  type: target.objectID.type,

  // organization: target.organization ? docFlowOrganization(target.organization) : null,
  // regNumber: target.regNumber ?? null,
  // statusChangeEnabled: target.statusChangeEnabled ?? null,
  // statusEnabled: target.statusEnabled ?? null,
  // status: target.status ? docFlowStatus(target.status) : null,
  // statusApproval: target.statusApproval ? docFlowStatus(target.statusApproval) : null,
  // statusPerformance: target.statusPerformance ? docFlowStatus(target.statusPerformance) : null,
  // statusRegistration: target.statusRegistration ? docFlowStatus(target.statusRegistration) : null,
  // regDate: target.regDate && target.regDate.toISOString() !== SOAP_DATE_NULL ? target.regDate : null,
  // author: target.author ? docFlowUser(target.author) : null,
  // responsible: target.responsible ? docFlowUser(target.responsible) : null,
  // subdivision: target.subdivision ? docFlowSubdivision(target.subdivision) : null,
  // title: target.title ?? null,
  // summary: target.summary ?? null,
  // files: target.files ? { object: target.files.map((file) => docFlowFile(file)), error: null } : null,
  // visas: target.visas ? target.visas.map((visa) => docFlowVisa(visa)) : null,
});

export const docFlowTargets = (target: DocFlowTargetSOAP): DocFlowBusinessProcessTarget => ({
  name: target.name,
  role: docFlowRole(target.role),
  target: docFlowInternalDocument(target.target),
  allowDeletion: target?.allowDeletion ?? false,
});

export const docFlowProcessStepToEnum = (processStep?: string): DocFlowProcessStep | undefined => {
  switch (processStep) {
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

export const docFlowTask = (task: DocFlowTaskSOAP): DocFlowTask => {
  const result: DocFlowTask = {
    id: task.objectID.id,
    name: task.name,
    type: task.objectID.type,
    presentation: task.objectID.presentation,
    navigationRef: task.objectID.navigationRef,
    importance: task.importance ? docFlowImportance(task.importance) : undefined,

    description: task.description,
    changeRight: task.changeRight,

    performer: task.performer?.user ? docFlowUser(task.performer.user) : undefined,
    executed: task.executed,
    executionMark: task.executionMark,
    executionComment: task.executionComment,

    author: docFlowUser(task.author),

    beginDate: dateSOAP(task.beginDate),
    dueDate: dateSOAP(task.dueDate),
    endDate: dateSOAP(task.endDate),

    accepted: task.accepted,
    acceptDate: dateSOAP(task.acceptDate),
    // number: task.number,

    processStep: docFlowProcessStepToEnum(task.businessProcessStep),
    state: task.state ? docFlowState(task.state) : undefined,
    htmlView: task.htmlView,

    target: task.target ? docFlowInternalDocument(task.target) : undefined,
    project: task.project ? docFlowProject(task.project) : undefined,
    targets: task.targets && Array.isArray(task.targets) ? task.targets.map((target) => docFlowTargets(target)) : undefined,
  };

  switch (task.objectID.type) {
    case 'DMBusinessProcessOrderTaskCheckup':
      (result as DocFlowBusinessProcessOrderTaskCheckup).iterationNumber = parseInt(task.iterationNumber || '0', 10);
      (result as DocFlowBusinessProcessOrderTaskCheckup).approvalResult = task.approvalResult && docFlowApprovalResult(task.approvalResult);
      // (result as DocFlowBusinessProcessOrderTaskCheckup).approvalResults =
      //   task.approvalResults && docFlowApprovalResults(task.approvalResults);
      (result as DocFlowBusinessProcessOrderTaskCheckup).returned = task.returned;
      break;
    case 'DMBusinessProcessApprovalTaskApproval':
      (result as DocFlowBusinessProcessApprovalTaskApproval).iterationNumber = parseInt(task.iterationNumber || '0', 10);
      (result as DocFlowBusinessProcessApprovalTaskApproval).approvalResult =
        task.approvalResult && docFlowApprovalResult(task.approvalResult);
      break;
    case 'DMBusinessProcessPerfomanceTaskCheckup':
      break;
    case 'DMBusinessProcessApprovalTaskCheckup':
      break;
    case 'DMBusinessProcessTask':
    default:
  }

  return result;

  //   {
  //   checkResults: task.checkResults
  //     ? task.checkResults.map((checkResult) => ({
  //         checkComment: checkResult.checkComment ?? '',
  //         executorTask: checkResult.executorTask ? docFlowTask(checkResult.executorTask) : null,
  //         returned: checkResult.returned ?? false,
  //       }))
  //     : null,
  //   parentTask: task.parentBusinessProcess ? docFlowParentTask(task.parentBusinessProcess) : null,
  // });
};

export const docFlowTasks = ({ tasks, loggerContext }: { tasks: DocFlowTasksSOAP[]; loggerContext?: LoggerContext }): DocFlowTasks[] =>
  tasks.map((task) => ({
    canHaveChildren: task.canHaveChildren,
    isFolder: task.isFolder,
    object: docFlowTask(task.object),
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
