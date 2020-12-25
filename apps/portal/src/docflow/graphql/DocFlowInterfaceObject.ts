/** @format */
import { ID, Field, InterfaceType } from '@nestjs/graphql';

@InterfaceType()
export abstract class DocFlowInterfaceObject {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field({ nullable: true })
  presentation?: string;

  @Field({ nullable: true })
  navigationRef?: string;
}
