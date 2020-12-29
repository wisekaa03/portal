/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowLegalPrivatePerson } from './DocFlowLegalPrivatePerson';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowOrganization extends DocFlowInterfaceObject {
  @Field({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  inn?: string;

  @Field({ nullable: true })
  kpp?: string;

  @Field(() => Boolean, { nullable: true })
  VATpayer?: boolean;

  @Field(() => DocFlowLegalPrivatePerson, { nullable: true })
  legalPrivatePerson?: DocFlowLegalPrivatePerson;
}
