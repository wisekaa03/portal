/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';

// TODO: доделать

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowBusinessProcessExecutorRole extends DocFlowInterfaceObject {
  @Field({ nullable: true })
  comment?: string;
}
