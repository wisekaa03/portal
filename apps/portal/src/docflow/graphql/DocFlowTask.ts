/** @format */

import { createUnionType } from '@nestjs/graphql';

import { DocFlowTask } from '@lib/types/docflow';
import { DocFlowTaskSOAP } from '@back/shared/types/docflowSOAP';

import { DocFlowBusinessProcessTask } from './DocFlowBusinessProcessTask';
import { DocFlowBusinessProcessOrderTaskCheckup } from './DocFlowBusinessProcessOrderTaskCheckup';
import { DocFlowBusinessProcessApprovalTaskApproval } from './DocFlowBusinessProcessApprovalTaskApproval';
import { DocFlowBusinessProcessPerfomanceTaskCheckup } from './DocFlowBusinessProcessPerfomanceTaskCheckup';
import { DocFlowBusinessProcessApprovalTaskCheckup } from './DocFlowBusinessProcessApprovalTaskCheckup';

export const DocFlowTaskGraphql = createUnionType({
  name: 'DocFlowTask',
  types: () => [
    DocFlowBusinessProcessTask,
    DocFlowBusinessProcessOrderTaskCheckup,
    DocFlowBusinessProcessApprovalTaskApproval,
    DocFlowBusinessProcessPerfomanceTaskCheckup,
    DocFlowBusinessProcessApprovalTaskCheckup,
  ],
  resolveType: (value: DocFlowTask) => {
    if (value.type === 'DMBusinessProcessTask') {
      return DocFlowBusinessProcessTask;
    }
    if (value.type === 'DMBusinessProcessOrderTaskCheckup') {
      return DocFlowBusinessProcessOrderTaskCheckup;
    }
    if (value.type === 'DMBusinessProcessApprovalTaskApproval') {
      return DocFlowBusinessProcessApprovalTaskApproval;
    }
    //                     this is intended -v
    if (value.type === 'DMBusinessProcessPerfomanceTaskCheckup') {
      return DocFlowBusinessProcessPerfomanceTaskCheckup;
    }
    if (value.type === 'DMBusinessProcessApprovalTaskCheckup') {
      return DocFlowBusinessProcessApprovalTaskCheckup;
    }

    return null;
  },
});

export const docFlowBusinessProcessTask = (result: DocFlowTask, task: DocFlowTaskSOAP): result is DocFlowBusinessProcessTask =>
  task.objectID.type === 'DMBusinessProcessTask';

export const docFlowBusinessProcessOrderTaskCheckup = (
  result: DocFlowTask,
  task: DocFlowTaskSOAP,
): result is DocFlowBusinessProcessOrderTaskCheckup => task.objectID.type === 'DMBusinessProcessOrderTaskCheckup';

export const docFlowBusinessProcessApprovalTaskApproval = (
  result: DocFlowTask,
  task: DocFlowTaskSOAP,
): result is DocFlowBusinessProcessApprovalTaskApproval => task.objectID.type === 'DMBusinessProcessApprovalTaskApproval';

export const docFlowBusinessProcessPerfomanceTaskCheckup = (
  result: DocFlowTask,
  task: DocFlowTaskSOAP,
  type: string,
): result is DocFlowBusinessProcessPerfomanceTaskCheckup => task.objectID.type === 'DMBusinessProcessPerfomanceTaskCheckup';

export const docFlowBusinessProcessApprovalTaskCheckup = (
  result: DocFlowTask,
  task: DocFlowTaskSOAP,
  type: string,
): result is DocFlowBusinessProcessApprovalTaskCheckup => task.objectID.type === 'DMBusinessProcessApprovalTaskCheckup';
