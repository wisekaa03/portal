/** @format */

import { InputType, Field } from '@nestjs/graphql';
import { TkWhere } from './TkWhere';

@InputType()
export class TkTaskNewInput {
  @Field(() => TkWhere, { nullable: true })
  where?: TkWhere;

  @Field({ nullable: true })
  subject?: string;

  @Field({ nullable: true })
  body?: string;

  @Field({ nullable: true })
  route?: string;

  @Field({ nullable: true })
  service?: string;

  @Field({ nullable: true })
  executorUser?: string;
}
