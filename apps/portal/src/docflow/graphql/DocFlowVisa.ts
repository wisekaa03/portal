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

  @Field(() => Date)
  date!: Date;

  @Field(() => Boolean)
  signed!: boolean;

  @Field(() => Boolean)
  signatureChecked!: boolean;

  @Field(() => Boolean)
  signatureValid!: boolean;

  @Field(() => DocFlowApprovalResult)
  result!: DocFlowApprovalResult;

  @Field()
  comment!: string;
}
