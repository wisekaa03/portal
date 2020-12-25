/** @format */

import { ObjectType, Field } from '@nestjs/graphql';
import { DocFlowBusinessProcessTask } from './DocFlowBusinessProcessTask';

@ObjectType()
export class DocFlowBusinessProcessPerfomanceTaskCheckupResult {
  @Field(() => DocFlowBusinessProcessTask, { nullable: true })
  executorTask?: DocFlowBusinessProcessTask;

  @Field(() => Boolean, { nullable: true })
  returned?: boolean;

  @Field({ nullable: true })
  checkComment?: string;
}
