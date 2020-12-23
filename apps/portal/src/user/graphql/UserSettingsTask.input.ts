/** @format */

import { Field, InputType } from '@nestjs/graphql';

import { UserSettingsTaskFavoriteInput } from './UserSettingsTaskFavorite.input';

@InputType()
export class UserSettingsTaskInput {
  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => [UserSettingsTaskFavoriteInput], { nullable: true })
  favorites?: UserSettingsTaskFavoriteInput[];
}
