/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';

// @todo: доделать

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowBusinessProcessExecutorRole extends DocFlowInterfaceObject {
  @Field({ nullable: true })
  comment?: string;
}
