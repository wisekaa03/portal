/** @format */

import { InputType, Field } from '@nestjs/graphql';
import { GraphQLInputQueryType } from './GraphQLInputQueryType';

@InputType()
export class DocFlowFileInput extends GraphQLInputQueryType {
  @Field({ nullable: false, description: 'ID of a document flow file' })
  id!: string;

  // @Field({ nullable: true, description: 'With files, default = true' })
  // withFiles?: boolean;
}
