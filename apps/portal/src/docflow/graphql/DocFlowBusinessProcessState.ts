/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowBusinessProcessState extends DocFlowInterfaceObject {}
