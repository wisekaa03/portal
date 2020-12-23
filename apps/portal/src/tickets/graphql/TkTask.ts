/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';

import { TkRoute } from './TkRoute';
import { TkService } from './TkService';
import { TkComment } from './TkComment';
import { TkFile } from './TkFile';
import { TkWhere } from './TkWhere';

@ObjectType()
export class TkTask {
  @Field(() => ID)
  id?: string;

  @Field(() => TkWhere)
  where?: TkWhere;

  @Field()
  code?: string;

  @Field()
  subject?: string;

  @Field()
  status?: string;

  @Field({ nullable: true })
  body?: string;

  @Field({ nullable: true })
  smallBody?: string;

  @Field(() => TkRoute, { nullable: true })
  route?: TkRoute;

  @Field(() => TkService, { nullable: true })
  service?: TkService;

  @Field(() => Date, { nullable: true })
  createdDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => Date, { nullable: true })
  timeoutDate?: Date;

  @Field({ nullable: true })
  initiatorUser?: string;

  @Field({ nullable: true })
  executorUser?: string;

  @Field({ nullable: true })
  availableAction?: string;

  @Field({ nullable: true })
  availableStages?: string;

  @Field(() => [TkFile], { nullable: true })
  files?: TkFile[];

  @Field(() => [TkComment], { nullable: true })
  comments?: TkComment[];
}
