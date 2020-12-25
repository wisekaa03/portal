/** @format */

import { Field, InterfaceType } from '@nestjs/graphql';

import { DocFlowProcessStep } from '@lib/types/docflow';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowBusinessProcessTaskImportance } from './DocFlowBusinessProcessTaskImportance';
import { DocFlowInternalDocument } from './DocFlowInternalDocument';
import { DocFlowUser } from './DocFlowUser';
import { DocFlowBusinessProcessState } from './DocFlowBusinessProcessState';
import { DocFlowProject } from './DocFlowProject';
import { DocFlowBusinessProcessTarget } from './DocFlowBusinessProcessTarget';

@InterfaceType()
export abstract class DocFlowInterfaceBusinessProcessTask extends DocFlowInterfaceObject {
  @Field(() => DocFlowBusinessProcessTaskImportance, { nullable: true })
  importance?: DocFlowBusinessProcessTaskImportance;

  @Field(() => DocFlowUser, { nullable: true })
  performer?: DocFlowUser;

  @Field(() => Boolean)
  executed!: boolean;

  @Field({ nullable: true })
  executionMark?: string;

  @Field({ nullable: true })
  executionComment?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  htmlView?: string;

  @Field(() => Boolean, { nullable: true })
  changeRight?: boolean;

  @Field(() => Date, { nullable: true })
  beginDate?: Date;

  @Field(() => Date, { nullable: true })
  dueDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => DocFlowUser)
  author!: DocFlowUser;

  @Field(() => Boolean)
  accepted?: boolean;

  @Field(() => Date, { nullable: true })
  acceptDate?: Date;

  @Field(() => DocFlowProcessStep, { nullable: true })
  processStep?: DocFlowProcessStep;

  @Field(() => DocFlowBusinessProcessState, { nullable: true })
  state?: DocFlowBusinessProcessState;

  @Field(() => DocFlowProject, { nullable: true })
  project?: DocFlowProject;

  @Field(() => DocFlowInternalDocument, { nullable: true })
  target?: DocFlowInternalDocument;

  @Field(() => [DocFlowBusinessProcessTarget], { nullable: true })
  targets?: DocFlowBusinessProcessTarget[];
}
