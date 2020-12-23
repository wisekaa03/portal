/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class LoginEmail {
  @Field(() => Boolean)
  login!: boolean;

  @Field({ nullable: true })
  error?: string;
}
