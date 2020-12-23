/** @format */

import { ObjectType, Field } from '@nestjs/graphql';
import { TkWhere } from './TkWhere';

@ObjectType()
export class TkTaskNew {
  @Field(() => TkWhere, { nullable: true })
  where?: TkWhere;

  @Field({ nullable: true })
  code?: string;

  @Field({ nullable: true })
  subject?: string;

  @Field({ nullable: true })
  route?: string;

  @Field({ nullable: true })
  service?: string;

  @Field({ nullable: true })
  organization?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Date, { nullable: true })
  createdDate?: Date;
}
