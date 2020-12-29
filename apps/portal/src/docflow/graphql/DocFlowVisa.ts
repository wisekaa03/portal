/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DocFlowApprovalResult } from './DocFlowApprovalResult';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowUser } from './DocFlowUser';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowVisa extends DocFlowInterfaceObject {
  @Field(() => DocFlowUser, { nullable: true })
  reviewer?: DocFlowUser;

  @Field(() => DocFlowUser, { nullable: true })
  addedBy?: DocFlowUser;

  @Field(() => Date, { nullable: true })
  date!: Date | null;

  @Field(() => Boolean, { nullable: true })
  signed!: boolean;

  @Field(() => Boolean, { nullable: true })
  signatureChecked?: boolean;

  @Field(() => Boolean, { nullable: true })
  signatureValid?: boolean;

  @Field(() => DocFlowApprovalResult, { nullable: true })
  result?: DocFlowApprovalResult;

  @Field({ nullable: true })
  comment?: string;
}
