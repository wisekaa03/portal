/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SearchSuggestions {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  avatar?: string;
}
