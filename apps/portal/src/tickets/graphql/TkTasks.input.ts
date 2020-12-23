/** @format */

import { InputType, Field } from '@nestjs/graphql';
import { TkWhere } from './TkWhere';

@InputType()
export class TkTasksInput {
  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  find?: string;

  @Field(() => TkWhere, { nullable: true })
  where?: TkWhere;

  @Field(() => String, { nullable: true })
  serviceId?: string;

  @Field(() => String, { nullable: true })
  routeId?: string;

  @Field(() => Boolean, { nullable: true })
  cache?: boolean;
}
