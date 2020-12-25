/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { DocFlowBusinessProcessExecutorRole } from './DocFlowBusinessProcessExecutorRole';
import { DocFlowUser } from './DocFlowUser';

@ObjectType()
export class DocFlowBusinessProcessTaskExecutor {
  @Field(() => DocFlowUser, { nullable: true })
  user?: DocFlowUser;

  @Field(() => DocFlowBusinessProcessExecutorRole, { nullable: true })
  role?: DocFlowBusinessProcessExecutorRole;
}
