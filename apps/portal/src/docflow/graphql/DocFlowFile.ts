/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';

import { ByteArray } from '@back/shared/ByteArray.scalar';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowFileVersion } from './DocFlowFileVersion';
import { DocFlowUser } from './DocFlowUser';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowFile extends DocFlowInterfaceObject {
  @Field(() => DocFlowUser, { nullable: true })
  author?: DocFlowUser;

  @Field(() => String, { nullable: true })
  binaryData?: string;

  @Field(() => Date, { nullable: true })
  creationDate?: Date;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Boolean, { nullable: true })
  editing?: boolean;

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

  // @Field({ nullable: true })
  // additionalProperties?: string;

  @Field({ nullable: true })
  text?: string;

  @Field(() => DocFlowUser, { nullable: true })
  owner?: DocFlowUser;

  @Field(() => Boolean, { nullable: true })
  scannedOriginal?: boolean;

  @Field(() => DocFlowFileVersion, { nullable: true })
  activeVersion?: DocFlowFileVersion;

  @Field(() => DocFlowUser, { nullable: true })
  editingUser?: DocFlowUser;

  @Field(() => Date, { nullable: true })
  lockDate?: Date;

  @Field(() => Boolean, { nullable: true })
  deletionMark?: boolean;

  @Field(() => DocFlowFile, { nullable: true })
  template?: DocFlowFile;
}
