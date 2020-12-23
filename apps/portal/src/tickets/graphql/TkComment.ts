/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { TkWhere } from './TkWhere';
import { TkFile } from './TkFile';

@ObjectType()
export class TkComment {
  @Field(() => ID)
  id?: string;

  @Field(() => TkWhere)
  where?: TkWhere;

  @Field()
  code?: string;

  @Field({ nullable: true })
  authorLogin?: string;

  @Field({ nullable: true })
  body?: string;

  @Field(() => Date, { nullable: true })
  date?: Date;

  @Field({ nullable: true })
  parentCode?: string;

  @Field(() => [TkFile], { nullable: true })
  files?: TkFile[];
}
