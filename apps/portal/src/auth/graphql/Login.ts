/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { User } from '@back/user/user.entity';
import { LoginEmail } from './LoginEmail';

@ObjectType()
export class Login {
  @Field(() => User)
  user!: User;

  @Field(() => LoginEmail, { nullable: true })
  loginEmail?: LoginEmail;
}
