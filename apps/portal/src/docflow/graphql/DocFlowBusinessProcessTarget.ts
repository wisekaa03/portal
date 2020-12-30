/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { DocFlowInternalDocument } from './DocFlowInternalDocument';
import { DocFlowBusinessProcessTargetRole } from './DocFlowBusinessProcessTargetRole';

@ObjectType({})
export class DocFlowBusinessProcessTarget {
  @Field({ nullable: true })
  name!: string;

  @Field(() => DocFlowBusinessProcessTargetRole, { nullable: true })
  role?: DocFlowBusinessProcessTargetRole;

  @Field(() => DocFlowInternalDocument, { nullable: true })
  target!: DocFlowInternalDocument;

  @Field(() => Boolean, { nullable: true })
  allowDeletion?: boolean;
}
