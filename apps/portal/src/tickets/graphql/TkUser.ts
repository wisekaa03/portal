/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TkWhere } from './TkWhere';

@ObjectType()
export class TkUser {
  @Field(() => ID)
  id?: string;

  @Field(() => TkWhere)
  where?: TkWhere;

  @Field()
  code?: string;

  @Field()
  name?: string;

  @Field({ nullable: true })
  login?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  telephone?: string;

  @Field({ nullable: true })
  company?: string;

  @Field({ nullable: true })
  department?: string;

  @Field({ nullable: true })
  division?: string;

  @Field({ nullable: true })
  manager?: string;

  @Field({ nullable: true })
  title?: string;
}
