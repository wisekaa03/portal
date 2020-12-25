/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowInterfaceBusinessProcessTask } from './DocFlowInterfaceBusinessProcessTask';

@ObjectType({
  implements: () => [DocFlowInterfaceObject, DocFlowInterfaceBusinessProcessTask],
})
export class DocFlowBusinessProcessPerfomanceTaskCheckup extends DocFlowInterfaceBusinessProcessTask {}
