/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TkWhere } from './TkWhere';

@ObjectType()
export class TkFile {
  @Field(() => ID)
  id?: string;

  @Field(() => TkWhere)
  where?: TkWhere;

  @Field()
  code?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  mime?: string;

  @Field({ nullable: true })
  body?: string;
}
