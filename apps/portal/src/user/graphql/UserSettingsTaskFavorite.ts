/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { TkWhere } from '@back/tickets/graphql/TkWhere';

@ObjectType()
export class UserSettingsTaskFavorite {
  @Field(() => TkWhere)
  where!: TkWhere;

  @Field(() => String)
  code!: string;

  @Field(() => String)
  svcCode!: string;
}
