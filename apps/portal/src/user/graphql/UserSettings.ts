/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserSettingsPhonebook } from './UserSettingsPhonebook';
import { UserSettingsTask } from './UserSettingsTask';

@ObjectType()
export class UserSettings {
  @Field({ nullable: true })
  lng?: string;

  @Field(() => Int, { nullable: true })
  fontSize?: number;

  @Field(() => Boolean, { nullable: true })
  drawer?: boolean;

  @Field(() => [UserSettingsPhonebook], { nullable: true })
  phonebook?: UserSettingsPhonebook;

  @Field(() => UserSettingsTask, { nullable: true })
  task?: UserSettingsTask;
}
