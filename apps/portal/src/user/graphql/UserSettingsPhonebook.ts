/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { PhonebookColumnNames } from '@back/profile/graphql';
import { UserSettingsPhonebookFilter } from './UserSettingsPhonebookFilter';

@ObjectType()
export class UserSettingsPhonebook {
  @Field(() => [PhonebookColumnNames], { nullable: true })
  columns?: PhonebookColumnNames[];

  @Field(() => [UserSettingsPhonebookFilter], { nullable: true })
  filters?: UserSettingsPhonebookFilter[];
}
