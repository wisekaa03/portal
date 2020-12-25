/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowApprovalType } from './DocFlowApprovalType';
import { DocFlowApprovalResult } from './DocFlowApprovalResult';
import { DocFlowDueDateSpecificationOption } from './DocFlowDueDateSpecificationOption';
import { DocFlowApprovalOrder } from './DocFlowApprovalOrder';

@ObjectType()
export class DocFlowBusinessProcessApprovalParticipant {
  @Field(() => [DocFlowApprovalOrder], { nullable: true })
  approvalOrder?: DocFlowApprovalOrder[];
}
