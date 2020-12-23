/** @format */

import { Field, Int, InputType } from '@nestjs/graphql';

import { UserSettingsPhonebookInput } from './UserSettingsPhonebook.input';
import { UserSettingsTaskInput } from './UserSettingsTask.input';

@InputType()
export class UserSettingsInput {
  @Field({ nullable: true })
  lng?: string;

  @Field(() => Int, { nullable: true })
  fontSize?: number;

  @Field(() => Boolean, { nullable: true })
  drawer?: boolean;

  @Field(() => [UserSettingsPhonebookInput], { nullable: true })
  phonebook?: UserSettingsPhonebookInput;

  @Field(() => UserSettingsTaskInput, { nullable: true })
  task?: UserSettingsTaskInput;
}
