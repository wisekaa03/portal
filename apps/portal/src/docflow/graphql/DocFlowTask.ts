/** @format */

import { createUnionType } from '@nestjs/graphql';

import { DocFlowTask } from '@lib/types/docflow';

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
