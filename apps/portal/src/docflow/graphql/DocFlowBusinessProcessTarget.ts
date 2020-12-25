/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { DocFlowInternalDocument } from './DocFlowInternalDocument';
import { DocFlowBusinessProcessTargetRole } from './DocFlowBusinessProcessTargetRole';

@ObjectType({})
export class DocFlowBusinessProcessTarget {
  @Field()
  name!: string;

  @Field(() => DocFlowBusinessProcessTargetRole)
  role!: DocFlowBusinessProcessTargetRole;

  @Field(() => DocFlowInternalDocument)
  target!: DocFlowInternalDocument;

  @Field(() => Boolean, { nullable: true })
  allowDeletion?: boolean;
}
