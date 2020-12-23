/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { TkTask } from './TkTask';
import { TkUser } from './TkUser';

@ObjectType()
export class TkEditTask {
  @Field(() => [TkUser], { nullable: true })
  users?: TkUser[];

  @Field(() => TkTask, { nullable: true })
  task?: TkTask;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}
