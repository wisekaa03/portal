/** @format */

import { ObjectType, Field } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowUser } from './DocFlowUser';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowSubdivision extends DocFlowInterfaceObject {
  @Field(() => [DocFlowUser], { nullable: true })
  head?: DocFlowUser[];
}
