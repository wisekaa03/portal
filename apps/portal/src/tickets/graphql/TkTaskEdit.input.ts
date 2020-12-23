/** @format */

import { InputType, Field } from '@nestjs/graphql';
import { TkWhere } from './TkWhere';

@InputType()
export class TkTaskEditInput {
  @Field(() => TkWhere, { nullable: true })
  where?: TkWhere;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  comment?: string;
}
