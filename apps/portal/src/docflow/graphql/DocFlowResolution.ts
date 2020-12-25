/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowUser } from './DocFlowUser';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowResolution extends DocFlowInterfaceObject {
  @Field(() => DocFlowUser, { nullable: true })
  reviewer?: DocFlowUser;

  @Field(() => DocFlowUser, { nullable: true })
  addedBy?: DocFlowUser;

  @Field(() => Date, { nullable: true })
  date?: Date;

  @Field(() => Boolean, { nullable: true })
  signed?: boolean;

  @Field(() => Boolean, { nullable: true })
  signatureChecked?: boolean;

  @Field(() => Boolean, { nullable: true })
  signatureValid?: boolean;

  @Field({ nullable: true })
  text?: string;
}
