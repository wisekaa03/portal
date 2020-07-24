/** @format */

//#region Imports NPM
import { Resolver, Mutation, Subscription } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
//#endregion
//#region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
//#endregion

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
  @UseGuards(GqlAuthGuard)
  pong(): any {
    return this.pubSub.asyncIterator(PONG_EVENT_NAME);
  }
}
