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
import { DocFlowBusinessProcess } from './DocFlowBusinessProcess';
import { DocFlowBusinessProcessTaskExecutor } from './DocFlowBusinessProcessTaskExecutor';

@InterfaceType({
  isAbstract: true,
})
export abstract class DocFlowInterfaceBusinessProcessTask extends DocFlowInterfaceObject implements DocFlowInterfaceObject {
  @Field(() => DocFlowBusinessProcessTaskImportance, { nullable: true })
  importance?: DocFlowBusinessProcessTaskImportance;

  @Field(() => DocFlowBusinessProcessTaskExecutor, { nullable: true })
  performer?: DocFlowBusinessProcessTaskExecutor;

  @Field(() => Boolean)
  executed!: boolean;

  @Field({ nullable: true })
  executionMark?: string;

  @Field(() => Date, { nullable: true })
  beginDate?: Date;

  @Field(() => Date, { nullable: true })
  dueDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => DocFlowInternalDocument, { nullable: true })
  target?: DocFlowInternalDocument;

  @Field({ nullable: true })
  description?: string;

  // @Field(() => DocFlowBusinessProcess, { nullable: true })
  // parentBusinessProcess?: DocFlowBusinessProcess;

  // @Field(() => [DocFlowBusinessProcess], { nullable: true })
  // businessProcesses?: DocFlowBusinessProcess[];

  @Field(() => DocFlowProcessStep, { nullable: true })
  businessProcessStep?: DocFlowProcessStep;

  @Field({ nullable: true })
  number?: string;

  @Field({ nullable: true })
  executionComment?: string;

  @Field(() => Boolean, { nullable: true })
  changeRight?: boolean;

  @Field(() => DocFlowUser)
  author!: DocFlowUser;

  @Field(() => Boolean)
  accepted?: boolean;

  @Field(() => Date, { nullable: true })
  acceptDate?: Date;

  @Field(() => DocFlowBusinessProcessState, { nullable: true })
  state?: DocFlowBusinessProcessState;

  @Field(() => DocFlowProject, { nullable: true })
  project?: DocFlowProject;

  // @Field(() => DocFlowProjectTask, { nullable: true })
  // projectTask?: DocFlowProjectTask;

  @Field(() => [DocFlowBusinessProcessTarget], { nullable: true })
  targets?: DocFlowBusinessProcessTarget[];

  // @Field(() => [DocFlowAdditionalProperty], { nullable: true })
  // additionalProperties?: DocFlowAdditionalProperty[];

  @Field({ nullable: true })
  htmlView?: string;

  __typename?: string;
}
