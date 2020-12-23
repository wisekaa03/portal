/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { TkUser } from './TkUser';
import { TkTask } from './TkTask';

@ObjectType()
export class TkTasks {
  @Field(() => [TkUser], { nullable: true })
  users?: TkUser[];

  @Field(() => [TkTask], { nullable: true })
  tasks?: TkTask[];

  @Field(() => [String], { nullable: true })
  errors?: string[];
}
