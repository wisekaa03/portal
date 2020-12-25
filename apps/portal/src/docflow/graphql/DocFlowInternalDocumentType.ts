/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowInternalDocumentType extends DocFlowInterfaceObject {
  @Field(() => Boolean, { nullable: true })
  performanceDateEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  correspondentEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  durationEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  sumEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  automaticNumeration?: boolean;

  @Field(() => Boolean, { nullable: true })
  cashFlowDetailsEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  organizationEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  productRowsEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  templateRequired?: boolean;

  @Field(() => Boolean, { nullable: true })
  addresseeEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  useConfirmation?: boolean;

  @Field(() => Boolean, { nullable: true })
  useSigningByManager?: boolean;

  @Field(() => Boolean, { nullable: true })
  accountingForCaseFilesEnabled?: boolean;
}
