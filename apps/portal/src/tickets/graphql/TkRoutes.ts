/** @format */

import { ObjectType, Field } from '@nestjs/graphql';
import { TkRoute } from './TkRoute';

@ObjectType()
export class TkRoutes {
  @Field(() => [TkRoute], { nullable: true })
  routes?: TkRoute[];

  @Field(() => [String], { nullable: true })
  errors?: string[];
}
