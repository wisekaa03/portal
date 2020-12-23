/** @format */

import { Field, InputType } from '@nestjs/graphql';

import { TkWhere } from '@back/tickets/graphql/TkWhere';

@InputType()
export class UserSettingsTaskFavoriteInput {
  @Field(() => TkWhere)
  where!: TkWhere;

  @Field(() => String)
  code!: string;

  @Field(() => String)
  svcCode!: string;
}
