/** @format */

import { InputType, Field } from '@nestjs/graphql';

@InputType({ isAbstract: true })
export abstract class GraphQLInputQueryType {
  @Field({ nullable: true, description: 'Cache this result, default = true' })
  cache?: boolean;

  @Field({ nullable: true, description: 'Set cache, default = true' })
  setCache?: boolean;

  @Field({ nullable: true, description: 'WebSocket results, default = true' })
  websocket?: boolean;
}
