/** @format */

import { ObjectType, Field } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowPrivatePerson extends DocFlowInterfaceObject {
  @Field(() => Date, { nullable: true })
  birthday?: Date;

  @Field({ nullable: true })
  comment?: string;
}
