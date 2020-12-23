/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AvailableAuthenticationProfiles {
  @Field()
  domain!: string;
}
