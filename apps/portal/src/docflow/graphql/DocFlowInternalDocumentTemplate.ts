/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowOrganization } from './DocFlowOrganization';
import { DocFlowInternalDocumentType } from './DocFlowInternalDocumentType';
import { DocFlowInternalDocumentFolder } from './DocFlowInternalDocumentFolder';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowInternalDocumentTemplate extends DocFlowInterfaceObject {
  @Field(() => DocFlowOrganization, { nullable: true })
  organization?: DocFlowOrganization;

  @Field(() => Boolean, { nullable: true })
  blockDerivedDocuments?: boolean;

  @Field(() => DocFlowInternalDocumentType, { nullable: true })
  documentType?: DocFlowInternalDocumentType;

  @Field(() => DocFlowInternalDocumentFolder, { nullable: true })
  folder?: DocFlowInternalDocumentFolder;
}
