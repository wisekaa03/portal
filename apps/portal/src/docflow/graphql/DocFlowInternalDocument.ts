/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
// import { DocFlowDocument } from './DocFlowDocument';
import { DocFlowInterfaceDocument } from './DocFlowInterfaceDocument';

import { DocFlowUser } from './DocFlowUser';
import { DocFlowInternalDocumentType } from './DocFlowInternalDocumentType';
import { DocFlowInternalDocumentFolder } from './DocFlowInternalDocumentFolder';
import { DocFlowCorrespondent } from './DocFlowCorrespondent';
import { DocFlowCashFlowRow } from './DocFlowCashFlowRow';
import { DocFlowVisa } from './DocFlowVisa';
import { DocFlowInternalDocumentTemplate } from './DocFlowInternalDocumentTemplate';
import { DocFlowResolution } from './DocFlowResolution';

@ObjectType({
  implements: () => [DocFlowInterfaceObject, DocFlowInterfaceDocument],
})
export class DocFlowInternalDocument extends DocFlowInterfaceDocument {
  @Field(() => DocFlowInternalDocumentType, { nullable: true })
  documentType?: DocFlowInternalDocumentType;

  @Field(() => DocFlowInternalDocumentFolder, { nullable: true })
  folder?: DocFlowInternalDocumentFolder;

  @Field(() => DocFlowUser, { nullable: true })
  author?: DocFlowUser;

  @Field(() => DocFlowUser, { nullable: true })
  signer?: DocFlowUser;

  @Field(() => Date, { nullable: true })
  beginDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => Boolean, { nullable: true })
  openEnded?: boolean;

  @Field(() => DocFlowCorrespondent, { nullable: true })
  correspondent?: DocFlowCorrespondent;

  // @Field(() => DocFlowContactPerson, { nullable: true })
  // contactPerson?: DocFlowContactPerson;

  // @Field(() => DocFlowProlongationProcedure, { nullable: true })
  // prolongationProcedure?: DocFlowProlongationProcedure;

  @Field(() => [DocFlowCashFlowRow], { nullable: true })
  cashFlowRows?: DocFlowCashFlowRow[];

  @Field(() => [DocFlowVisa], { nullable: true })
  visas?: DocFlowVisa[];

  @Field(() => [DocFlowResolution], { nullable: true })
  resolutions?: DocFlowResolution[];

  @Field(() => [DocFlowInternalDocumentTemplate], { nullable: true })
  template?: DocFlowInternalDocumentTemplate;

  @Field(() => Int, { nullable: true })
  VAT?: number;

  // @Field(() => [DocFlowProductRows], { nullable: true })
  // productRows?: DocFlowProductRows[];

  @Field(() => DocFlowUser, { nullable: true })
  addressee?: DocFlowUser;
}
