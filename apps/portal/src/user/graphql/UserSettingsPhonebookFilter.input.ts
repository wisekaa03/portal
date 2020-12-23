/** @format */

import { Field, InputType } from '@nestjs/graphql';
import { PhonebookColumnNames } from '@back/profile/graphql/PhonebookColumnNames';

@InputType()
export class UserSettingsPhonebookFilterInput {
  @Field(() => PhonebookColumnNames)
  name?: PhonebookColumnNames;

  @Field(() => String)
  value?: string;
}
