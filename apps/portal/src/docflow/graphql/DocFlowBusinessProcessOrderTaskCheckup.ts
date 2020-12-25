/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowInterfaceBusinessProcessTask } from './DocFlowInterfaceBusinessProcessTask';
import { DocFlowApprovalResult } from './DocFlowApprovalResult';
import { DocFlowBusinessProcessApprovalTaskCheckupApprovalResult } from './DocFlowBusinessProcessApprovalTaskCheckupApprovalResult';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowBusinessProcessOrderTaskCheckup
  extends DocFlowInterfaceBusinessProcessTask
  implements DocFlowInterfaceObject, DocFlowInterfaceBusinessProcessTask {
  @Field(() => Int, { nullable: true })
  iterationNumber?: number;

  @Field(() => Boolean, { nullable: true })
  returned?: boolean;
}
