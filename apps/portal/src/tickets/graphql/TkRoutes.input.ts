/** @format */

import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class TkRoutesInput {
  @Field(() => Boolean, { nullable: true })
  cache?: boolean;
}
