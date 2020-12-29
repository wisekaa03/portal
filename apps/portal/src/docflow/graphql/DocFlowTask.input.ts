/** @format */

import { InputType, Field } from '@nestjs/graphql';
import { GraphQLInputQueryType } from './GraphQLInputQueryType';

@InputType()
export class DocFlowTaskInput extends GraphQLInputQueryType {
  @Field({ nullable: false, description: 'ID of a document flow task' })
  id!: string;

  @Field({ nullable: false, description: 'Type of a document flow task' })
  type!: string;

  // @Field({ nullable: true, description: 'With files, default = true' })
  // withFiles?: boolean;
}
