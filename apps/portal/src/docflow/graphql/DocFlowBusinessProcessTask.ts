/** @format */

import { ObjectType } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowInterfaceBusinessProcessTask } from './DocFlowInterfaceBusinessProcessTask';

@ObjectType({
  implements: () => [DocFlowInterfaceObject, DocFlowInterfaceBusinessProcessTask],
})
export class DocFlowBusinessProcessTask extends DocFlowInterfaceBusinessProcessTask {}
