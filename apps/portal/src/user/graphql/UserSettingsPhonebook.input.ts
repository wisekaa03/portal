/** @format */

import { Field, InputType } from '@nestjs/graphql';

import { PhonebookColumnNames } from '@back/profile/graphql';
import { UserSettingsPhonebookFilterInput } from './UserSettingsPhonebookFilter.input';

@InputType()
export class UserSettingsPhonebookInput {
  @Field(() => [PhonebookColumnNames], { nullable: true })
  columns?: PhonebookColumnNames[];

  @Field(() => [UserSettingsPhonebookFilterInput], { nullable: true })
  filters?: UserSettingsPhonebookFilterInput[];
}
