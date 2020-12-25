/** @format */

import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DocFlowInterfaceObject } from './DocFlowInterfaceObject';
import { DocFlowTaskGraphql } from './DocFlowTask';

@ObjectType()
export class DocFlowTasks {
  @Field(() => Boolean, { nullable: true })
  canHaveChildren?: boolean;

  @Field(() => Boolean, { nullable: true })
  isFolder?: boolean;

  @Field(() => DocFlowTaskGraphql, { nullable: true })
  task?: typeof DocFlowTaskGraphql;
}
