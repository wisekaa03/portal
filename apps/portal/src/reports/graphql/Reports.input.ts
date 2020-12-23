/** @format */

import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ReportsInput {
  @Field(() => Date, { nullable: true })
  date?: Date;
}
