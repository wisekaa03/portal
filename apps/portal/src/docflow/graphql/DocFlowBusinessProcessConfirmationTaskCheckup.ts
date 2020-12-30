/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowInterfaceBusinessProcessTask } from './DocFlowInterfaceBusinessProcessTask';
import { DocFlowBusinessProcessTaskExecutor } from './DocFlowBusinessProcessTaskExecutor';
import { DocFlowConfirmationResult } from './DocFlowConfirmationResult';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowBusinessProcessConfirmationTaskCheckup
  extends DocFlowInterfaceBusinessProcessTask
  implements DocFlowInterfaceObject, DocFlowInterfaceBusinessProcessTask {
  @Field(() => Int, { nullable: true })
  iterationNumber?: number;

  @Field(() => DocFlowConfirmationResult, { nullable: true })
  confirmationResult?: DocFlowConfirmationResult;

  @Field({ nullable: true })
  confirmationComment?: string;

  @Field(() => DocFlowBusinessProcessTaskExecutor, { nullable: true })
  confirmationPerformer?: DocFlowBusinessProcessTaskExecutor;

  @Field(() => Date, { nullable: true })
  confirmationDate?: Date;

  @Field(() => Boolean, { nullable: true })
  returned?: boolean;
}
