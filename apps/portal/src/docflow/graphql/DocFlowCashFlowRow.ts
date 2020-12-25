/** @format */

import { ObjectType, Field, Float } from '@nestjs/graphql';

import { DocFlowCashFlowItem } from './DocFlowCashFlowItem';

@ObjectType()
export class DocFlowCashFlowRow {
  @Field(() => [DocFlowCashFlowItem])
  item!: DocFlowCashFlowItem[];

  @Field(() => Float)
  total!: number;

  @Field(() => Float)
  VAT!: number;
}
