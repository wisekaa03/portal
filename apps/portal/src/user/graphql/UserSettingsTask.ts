/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { UserSettingsTaskFavorite } from './UserSettingsTaskFavorite';

@ObjectType()
export class UserSettingsTask {
  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => [UserSettingsTaskFavorite], { nullable: true })
  favorites?: UserSettingsTaskFavorite[];
}
