/** @format */

import { ObjectType, Field } from '@nestjs/graphql';

import { DocFlowDocument } from './DocFlowDocument';
import { DocFlowRelationType } from './DocFlowRelationType';

@ObjectType()
export class DocFlowDocumentRelation {
  @Field(() => [DocFlowDocument], { nullable: true })
  document?: DocFlowDocument;

  @Field(() => [DocFlowRelationType], { nullable: true })
  relationType?: DocFlowRelationType[];

  @Field(() => [DocFlowDocument], { nullable: true })
  relatedDocument?: DocFlowDocument;
}
