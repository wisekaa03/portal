/** @format */

import { Resolver, Mutation, Subscription } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';

const PONG_EVENT_NAME = 'pong';

@Resolver('Ping')
export class PingPongResolvers {
  constructor(@Inject('PUB_SUB') private pubSub: RedisPubSub) {}

  @Mutation('ping')
  async ping(): Promise<any> {
    const pingId = Date.now();
    this.pubSub.publish(PONG_EVENT_NAME, { [PONG_EVENT_NAME]: { pingId } });
    return { id: pingId };
  }

  @Subscription(PONG_EVENT_NAME)
  pong(): any {
    return this.pubSub.asyncIterator(PONG_EVENT_NAME);
  }
}
