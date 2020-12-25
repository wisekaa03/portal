/** @format */

import { ObjectType } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';

@ObjectType({
  implements: () => [DocFlowInterfaceObject],
})
export class DocFlowActivityMatter extends DocFlowInterfaceObject {}
