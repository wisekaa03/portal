/** @format */

import { InputType, Field } from '@nestjs/graphql';
import { GraphQLInputQueryType } from './GraphQLInputQueryType';

@InputType()
export class DocFlowTasksInput extends GraphQLInputQueryType {
  @Field({ nullable: true, description: 'With files, default = true' })
  withFiles?: boolean;
}
