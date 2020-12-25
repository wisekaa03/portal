/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowInterfaceBusinessProcessTask } from './DocFlowInterfaceBusinessProcessTask';

@ObjectType({
  implements: () => [DocFlowInterfaceObject, DocFlowInterfaceBusinessProcessTask],
})
export class DocFlowBusinessProcessApprovalTaskCheckup extends DocFlowInterfaceBusinessProcessTask {}
