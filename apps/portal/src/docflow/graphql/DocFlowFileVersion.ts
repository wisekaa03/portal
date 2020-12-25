/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowUser } from './DocFlowUser';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowFileVersion extends DocFlowInterfaceObject {
  @Field(() => DocFlowUser, { nullable: true })
  author?: DocFlowUser;

  @Field({ nullable: true })
  binaryData?: string;

  @Field(() => Date, { nullable: true })
  creationDate?: Date;

  @Field(() => Boolean, { nullable: true })
  encrypted?: boolean;

  @Field({ nullable: true })
  extension?: string;

  @Field(() => Date, { nullable: true })
  modificationDate?: Date;

  @Field(() => Date, { nullable: true })
  modificationDateUniversal?: Date;

  // @Field(() => String, { nullable: true })
  // signatures?: string;

  @Field(() => Boolean, { nullable: true })
  signed?: boolean;

  @Field(() => Int, { nullable: true })
  size?: number;

  @Field({ nullable: true })
  text?: string;

  @Field(() => DocFlowUser, { nullable: true })
  owner?: DocFlowUser;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => Boolean, { nullable: true })
  deletionMark?: boolean;
}
