/** @format */

import { InputType, Field } from '@nestjs/graphql';
import { OrderDirection } from 'typeorm-graphql-pagination';
import { PhonebookColumnNames } from './PhonebookColumnNames';

@InputType()
export class ProfileOrderInput {
  @Field(() => OrderDirection, { nullable: true })
  direction?: OrderDirection;

  @Field(() => PhonebookColumnNames, { nullable: true })
  field?: PhonebookColumnNames;
}
