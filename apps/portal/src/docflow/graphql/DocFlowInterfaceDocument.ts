/** @format */

import { Field, InterfaceType, Int } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowAccessLevel } from './DocFlowAccessLevel';
import { DocFlowDocumentStatus } from './DocFlowDocumentStatus';
import { DocFlowUser } from './DocFlowUser';
import { DocFlowCurrency } from './DocFlowCurrency';
import { DocFlowOrganization } from './DocFlowOrganization';
import { DocFlowSubdivision } from './DocFlowSubdivision';
import { DocFlowProject } from './DocFlowProject';
import { DocFlowFile } from './DocFlowFile';
import { DocFlowActivityMatter } from './DocFlowActivityMatter';
import { DocFlowDocumentRelation } from './DocFlowDocumentRelation';

@InterfaceType()
export abstract class DocFlowInterfaceDocument extends DocFlowInterfaceObject implements DocFlowInterfaceObject {
  @Field(() => DocFlowAccessLevel, { nullable: true })
  accessLevel?: DocFlowAccessLevel;

  @Field(() => DocFlowCurrency, { nullable: true })
  currency?: DocFlowCurrency;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => DocFlowOrganization, { nullable: true })
  organization?: DocFlowOrganization;

  @Field(() => Date, { nullable: true })
  performanceDate?: Date;

  @Field(() => Date, { nullable: true })
  regDate?: Date;

  @Field(() => DocFlowActivityMatter, { nullable: true })
  activityMatter?: DocFlowActivityMatter;

  @Field(() => DocFlowUser, { nullable: true })
  responsible?: DocFlowUser;

  @Field({ nullable: true })
  regNumber?: string;

  @Field(() => DocFlowDocumentStatus, { nullable: true })
  status?: DocFlowDocumentStatus;

  @Field(() => DocFlowSubdivision, { nullable: true })
  subdivision?: DocFlowSubdivision;

  @Field(() => Int, { nullable: true })
  sum?: number;

  @Field({ nullable: true })
  summary?: string;

  @Field({ nullable: true })
  title?: string;

  // @Field(() => [DocFlowAdditionalProperty], { nullable: true })
  // additionalProperites?: DocFlowAdditionalProperty;

  @Field(() => [DocFlowFile], { nullable: true })
  files?: DocFlowFile[];

  @Field(() => [DocFlowDocumentRelation], { nullable: true })
  relations?: DocFlowDocumentRelation[];

  @Field(() => Boolean, { nullable: true })
  organizationEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  activityMatterEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  accessLevelEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  filesEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  documentTypeEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  statusEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  statusChangeEnabled?: boolean;

  // @Field(() => [DocFlowSignatures], { nullable: true })
  // signatures?: DocFlowSignatures[];

  @Field({ nullable: true })
  enabledProperties?: string;

  @Field(() => Boolean, { nullable: true })
  limitPropertiesAvailability?: boolean;

  @Field({ nullable: true })
  keyPropertiesValue?: string;

  @Field(() => Boolean, { nullable: true })
  projectsEnabled?: boolean;

  @Field(() => DocFlowProject, { nullable: true })
  project?: DocFlowProject;

  @Field(() => DocFlowDocumentStatus, { nullable: true })
  statusRegistration?: DocFlowDocumentStatus;

  @Field(() => DocFlowDocumentStatus, { nullable: true })
  statusConsideration?: DocFlowDocumentStatus;

  @Field(() => DocFlowDocumentStatus, { nullable: true })
  statusApproval?: DocFlowDocumentStatus;

  @Field(() => DocFlowDocumentStatus, { nullable: true })
  statusSigning?: DocFlowDocumentStatus;

  @Field(() => DocFlowDocumentStatus, { nullable: true })
  statusPerformance?: DocFlowDocumentStatus;

  @Field(() => Boolean, { nullable: true })
  containsScannedOriginals?: boolean;

  @Field(() => Boolean, { nullable: true })
  deletionMark?: boolean;

  @Field(() => Boolean, { nullable: true })
  titleBlockedByTemplate?: boolean;

  @Field(() => Boolean, { nullable: true })
  checkRelations?: boolean;

  @Field(() => Boolean, { nullable: true })
  registrationAvailable?: boolean;

  @Field(() => Int, { nullable: true })
  numberOfSheets?: number;

  @Field(() => Int, { nullable: true })
  numberOfAnnexes?: number;

  @Field(() => Int, { nullable: true })
  sheetsOfAnnexes?: number;

  @Field(() => Int, { nullable: true })
  numberOfCopies?: number;

  @Field(() => Boolean, { nullable: true })
  contentAvailable?: boolean;

  // @Field(() => DocFlowCaseFilesCatalog, { nullable: true })
  // useFilesCatalog?: DocFlowCaseFilesCatalog;

  // @Field(() => DocFlowCaseFilesDossiers, { nullable: true })
  // useFilesDossier?: DocFlowCaseFilesDossiers;

  @Field(() => Boolean, { nullable: true })
  useCaseFiles?: boolean;
}
