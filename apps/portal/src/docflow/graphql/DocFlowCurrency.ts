/** @format */

import { ObjectType, Field } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowCurrency extends DocFlowInterfaceObject {
  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  fullName?: string;
}
