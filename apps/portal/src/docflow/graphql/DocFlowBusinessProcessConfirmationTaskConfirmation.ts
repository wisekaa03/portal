/** @format */

import { ObjectType, Field, Int } from '@nestjs/graphql';

import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowInterfaceBusinessProcessTask } from './DocFlowInterfaceBusinessProcessTask';
import { DocFlowBusinessProcessTaskExecutor } from './DocFlowBusinessProcessTaskExecutor';
import { DocFlowConfirmationResult } from './DocFlowConfirmationResult';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowBusinessProcessConfirmationTaskConfirmation
  extends DocFlowInterfaceBusinessProcessTask
  implements DocFlowInterfaceObject, DocFlowInterfaceBusinessProcessTask {
  @Field(() => Int, { nullable: true })
  iterationNumber?: number;

  @Field(() => DocFlowConfirmationResult, { nullable: true })
  confirmationResult?: DocFlowConfirmationResult;
}
