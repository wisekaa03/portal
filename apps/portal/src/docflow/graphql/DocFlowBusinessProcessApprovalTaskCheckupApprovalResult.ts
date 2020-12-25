/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { DocFlowApprovalResult } from './DocFlowApprovalResult';
import { DocFlowBusinessProcessTaskExecutor } from './DocFlowBusinessProcessTaskExecutor';

@ObjectType()
export class DocFlowBusinessProcessApprovalTaskCheckupApprovalResult {
  @Field(() => DocFlowApprovalResult, { nullable: true })
  approvalResult?: DocFlowApprovalResult;

  @Field({ nullable: true })
  approvalComment?: string;

  @Field(() => DocFlowBusinessProcessTaskExecutor, { nullable: true })
  approvalPerformer?: DocFlowBusinessProcessTaskExecutor;

  @Field(() => Date, { nullable: true })
  approvalDate?: Date;
}
