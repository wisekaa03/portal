/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';

import { DocFlowExecutionMark } from '@lib/types/docflow';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowUser } from './DocFlowUser';
import { DocFlowBusinessProcessImportance } from './DocFlowBusinessProcessImportance';
import { DocFlowBusinessProcessTask } from './DocFlowBusinessProcessTask';
import { DocFlowInternalDocument } from './DocFlowInternalDocument';
import { DocFlowBusinessProcessState } from './DocFlowBusinessProcessState';
import { DocFlowProject } from './DocFlowProject';
import { DocFlowBusinessProcessTarget } from './DocFlowBusinessProcessTarget';
import { DocFlowDueDateSpecificationOption } from './DocFlowDueDateSpecificationOption';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowBusinessProcess extends DocFlowInterfaceObject {
  @Field(() => DocFlowUser, { nullable: true })
  author?: DocFlowUser;

  @Field(() => DocFlowBusinessProcessImportance, { nullable: true })
  importance?: DocFlowBusinessProcessImportance;

  @Field(() => Date, { nullable: true })
  beginDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;

  @Field(() => [DocFlowBusinessProcessTask], { nullable: true })
  tasks?: DocFlowBusinessProcessTask[];

  @Field(() => DocFlowInternalDocument, { nullable: true })
  target?: DocFlowInternalDocument;

  @Field(() => Boolean, { nullable: true })
  started?: boolean;

  @Field(() => Boolean, { nullable: true })
  completed?: boolean;

  @Field(() => DocFlowExecutionMark, { nullable: true })
  completionMark?: DocFlowExecutionMark;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date, { nullable: true })
  dueDate?: Date;

  @Field(() => DocFlowBusinessProcessTask, { nullable: true })
  parentTask?: DocFlowBusinessProcessTask;

  @Field(() => DocFlowBusinessProcessState, { nullable: true })
  state?: DocFlowBusinessProcessState;

  @Field(() => Boolean, { nullable: true })
  dueTimeEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  parentTaskEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  stateEnabled?: boolean;

  // @Field(() => DocFlowBusinessProcessTemplate, { nullable: true })
  // businessProcessTemplate?: DocFlowBusinessProcessTemplate;

  @Field(() => DocFlowProject, { nullable: true })
  project?: DocFlowProject;

  @Field({ nullable: true })
  executionComment?: string;

  @Field(() => Boolean, { nullable: true })
  blockedByTemplate?: boolean;

  @Field(() => [DocFlowBusinessProcessTarget], { nullable: true })
  targets?: DocFlowBusinessProcessTarget[];

  @Field(() => DocFlowDueDateSpecificationOption, { nullable: true })
  dueDateSpecificationOption?: DocFlowDueDateSpecificationOption;

  @Field(() => Int, { nullable: true })
  dueDateDays?: number;

  @Field(() => Int, { nullable: true })
  dueDateHours?: number;

  @Field(() => Int, { nullable: true })
  dueDateMinutes?: number;

  @Field(() => DocFlowBusinessProcessTask, { nullable: true })
  leadingTask?: DocFlowBusinessProcessTask;

  @Field(() => Boolean, { nullable: true })
  leadingTaskEnabled?: boolean;
}
