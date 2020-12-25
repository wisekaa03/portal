/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowApprovalType } from './DocFlowApprovalType';
import { DocFlowApprovalResult } from './DocFlowApprovalResult';
import { DocFlowDueDateSpecificationOption } from './DocFlowDueDateSpecificationOption';
import { DocFlowBusinessProcessApprovalParticipant } from './DocFlowBusinessProcessApprovalParticipant';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowBusinessProcessApproval extends DocFlowInterfaceObject {
  @Field(() => Int, { nullable: true })
  durationDays?: number;

  @Field(() => Int, { nullable: true })
  durationHours?: number;

  @Field(() => DocFlowBusinessProcessApprovalParticipant, { nullable: true })
  performers?: DocFlowBusinessProcessApprovalParticipant;

  @Field(() => DocFlowApprovalType, { nullable: true })
  approvalType?: DocFlowApprovalType;

  @Field(() => DocFlowApprovalResult, { nullable: true })
  executionResult?: DocFlowApprovalResult;

  @Field(() => Int, { nullable: true })
  iterationNumber?: number;

  @Field(() => DocFlowDueDateSpecificationOption, { nullable: true })
  resultProcessingDueDateSpecificationOption?: DocFlowDueDateSpecificationOption;

  @Field(() => Date, { nullable: true })
  resultProcessingDueDate?: Date;

  @Field(() => Int, { nullable: true })
  resultProcessingDueDateDays?: number;

  @Field(() => Int, { nullable: true })
  resultProcessingDueDateHours?: number;

  @Field(() => Int, { nullable: true })
  resultProcessingDueDateMinutes?: number;
}
