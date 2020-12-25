/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowLegalPrivatePerson } from './DocFlowLegalPrivatePerson';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowCorrespondent extends DocFlowInterfaceObject {
  @Field(() => DocFlowLegalPrivatePerson, { nullable: true })
  legalPrivatePerson?: DocFlowLegalPrivatePerson;

  @Field({ nullable: true })
  inn?: string;

  @Field({ nullable: true })
  kpp?: string;
}
