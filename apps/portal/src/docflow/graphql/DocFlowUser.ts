/** @format */

import { ObjectType, Field } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowPrivatePerson } from './DocFlowPrivatePerson';
import { DocFlowSubdivision } from './DocFlowSubdivision';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowUser extends DocFlowInterfaceObject {
  @Field(() => DocFlowSubdivision, { nullable: true })
  subdivision?: DocFlowSubdivision;

  @Field(() => DocFlowPrivatePerson, { nullable: true })
  privatePerson?: DocFlowPrivatePerson;
}
