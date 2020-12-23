/** @format */

import { ObjectType, Field } from '@nestjs/graphql';
import { PhonebookColumnNames } from '@back/profile/graphql/PhonebookColumnNames';

@ObjectType()
export class UserSettingsPhonebookFilter {
  @Field(() => PhonebookColumnNames)
  name!: PhonebookColumnNames;

  @Field(() => String)
  value!: string;
}
