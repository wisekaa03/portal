/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowBusinessProcessTaskImportance extends DocFlowInterfaceObject {}
