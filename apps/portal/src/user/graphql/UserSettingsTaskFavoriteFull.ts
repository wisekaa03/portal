/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { TkRoute, TkService } from '@back/tickets/graphql';

@ObjectType()
export class UserSettingsTaskFavoriteFull {
  @Field(() => TkRoute)
  route!: TkRoute;

  @Field(() => TkService)
  service!: TkService;
}
