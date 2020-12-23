/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TkWhere } from './TkWhere';

@ObjectType()
export class TkService {
  @Field(() => ID)
  id?: string;

  @Field(() => TkWhere)
  where?: TkWhere;

  @Field()
  code?: string;

  @Field()
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  route?: string;
}
