/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowInterfaceBusinessProcessTask } from './DocFlowInterfaceBusinessProcessTask';
import { DocFlowApprovalResult } from './DocFlowApprovalResult';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowBusinessProcessApprovalTaskApproval
  extends DocFlowInterfaceBusinessProcessTask
  implements DocFlowInterfaceObject, DocFlowInterfaceBusinessProcessTask {
  @Field(() => Int, { nullable: true })
  iterationNumber?: number;

  @Field(() => DocFlowApprovalResult, { nullable: true })
  approvalResult?: DocFlowApprovalResult;
}
