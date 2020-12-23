/** @format */

import { InputType, Field } from '@nestjs/graphql';
import { TkWhere } from './TkWhere';

@InputType()
export class TkFileInput {
  @Field(() => TkWhere, { nullable: true })
  where?: TkWhere;

  @Field({ nullable: true })
  code?: string;
}
