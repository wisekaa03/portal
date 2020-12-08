/** @format */

import { format as dateFnsFormat } from 'date-fns';
import type { DocFlowTask, DocFlowData } from '@lib/types/docflow';
import { DocFlowProcessStep } from '@lib/types/docflow';

export const docFlowOutputProcessStep = (processStep: DocFlowProcessStep): string | null => {
  switch (processStep) {
    case DocFlowProcessStep.Execute:
      return 'Исполнить';
    case DocFlowProcessStep.Familiarize:
      return 'Ознакомиться';
    case DocFlowProcessStep.Conform:
      return 'Согласовано';
    case DocFlowProcessStep.ConformWithComments:
      return 'СогласованоСЗамечаниями';
    case DocFlowProcessStep.NotConform:
      return 'НеСогласовано';
    case DocFlowProcessStep.Approve:
      return 'Утверждено';
    case DocFlowProcessStep.NotApprove:
      return 'НеУтверждено';

    default:
  }

  return null;
};

export function docFlowOutputTargets(task: DocFlowTask): Record<string, any> {
  let query: Record<string, any> = {};

  query = {
    'tns:targets': {
      'tns:items': task.targets?.map((target) => ({
        'tns:role': {
          'tns:name': target.role.name,
          'tns:objectID': {
            'tns:id': target.role.id,
            'tns:type': target.role.type,
          },
        },
        'tns:name': target.name,
        'tns:target': {
          'attributes': {
            'xsi:type': 'tns:DMInternalDocument',
          },
          'tns:name': target.target.name,
          'tns:objectID': {
            'tns:id': target.target.id,
            'tns:type': target.target.type,
          },
        },
        'tns:allowDeletion': target.allowDeletion ?? false,
      })),
    },
  };

  return query;
}

export const docFlowRequestProcessStep = (task: DocFlowTask, processStep: DocFlowProcessStep, data?: DocFlowData): Record<string, any> => {
  let query: Record<string, any> = {};

  query = {
    'tns:request': {
      'attributes': {
        'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:type': 'tns:DMUpdateRequest',
      },
      'tns:dataBaseID': '',
      'tns:objects': {
        'attributes': {
          'xsi:type': `tns:${task.type}`,
        },
        'tns:name': task.name,
        'tns:objectID': {
          'tns:id': task.id,
          'tns:type': task.type,
        },
        'tns:importance': {
          'tns:name': task.importance?.name,
          'tns:objectID': {
            'tns:id': task.importance?.id,
            'tns:type': task.importance?.type,
          },
        },
        'tns:performer': {
          'tns:user': {
            'tns:name': task.performer?.name,
            'tns:objectID': {
              'tns:id': task.performer?.id,
              'tns:type': task.performer?.type,
            },
          },
        },
        'tns:executed': task.executed,
        'tns:beginDate': task.beginDate ? dateFnsFormat(new Date(task.beginDate), "yyyy-MM-dd'T'hh:mm:ss") : '0001-01-01T00:00:00',
        'tns:dueDate': task.dueDate ? dateFnsFormat(new Date(task.dueDate), "yyyy-MM-dd'T'hh:mm:ss") : '0001-01-01T00:00:00',
        'tns:endDate': data?.endDate ? dateFnsFormat(new Date(data.endDate), "yyyy-MM-dd'T'hh:mm:ss") : '0001-01-01T00:00:00',
        'tns:description': task.description,
        'tns:parentBusinessProcess': {
          'attributes': {
            'xsi:type': `tns:${task.parentTask?.type}`,
          },
          'tns:name': task.parentTask?.name,
          'tns:objectID': {
            'tns:id': task.parentTask?.id,
            'tns:type': task.parentTask?.type,
          },
        },
        ...docFlowOutputTargets(task),
        'tns:businessProcessStep': docFlowOutputProcessStep(processStep),
        'tns:executionComment': data?.comments ?? task.executionComment,
      },
    },
  };

  return query;
};
