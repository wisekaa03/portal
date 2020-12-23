/** @format */

import { InputType, Field } from '@nestjs/graphql';
import { TkWhere } from './TkWhere';

@InputType()
export class TkTaskInput {
  @Field(() => TkWhere)
  where?: TkWhere;

  @Field()
  code?: string;

  @Field(() => Boolean, { nullable: true })
  cache?: boolean;
}
