/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowInterfaceBusinessProcessTask } from './DocFlowInterfaceBusinessProcessTask';
import { DocFlowBusinessProcessPerfomanceTaskCheckupResult } from './DocFlowBusinessProcessPerfomanceTaskCheckupResult';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowBusinessProcessPerfomanceTaskCheckup
  extends DocFlowInterfaceBusinessProcessTask
  implements DocFlowInterfaceObject, DocFlowInterfaceBusinessProcessTask {
  @Field(() => Int, { nullable: true })
  iterationNumber?: number;

  @Field(() => [DocFlowBusinessProcessPerfomanceTaskCheckupResult], { nullable: true })
  checkResults?: DocFlowBusinessProcessPerfomanceTaskCheckupResult[];
}
