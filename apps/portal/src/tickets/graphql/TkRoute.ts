/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';

import { TkWhere } from './TkWhere';
import { TkService } from './TkService';

@ObjectType()
export class TkRoute {
  @Field(() => ID)
  id?: string;

  @Field(() => TkWhere)
  where?: TkWhere;

  @Field()
  code?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => [TkService], { nullable: true })
  services?: TkService[];
}
