/** @format */
/// <reference types="../../../../typings/global" />

//#region Imports NPM
import { Module } from '@nestjs/common';
import { RedisService } from 'nest-redis';
import { RedisPubSub } from 'graphql-redis-subscriptions';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
//#endregion

@Module({
  imports: [],

  providers: [
    {
      provide: 'PUB_SUB',
      inject: [ConfigService, RedisService],
      useFactory: (configService: ConfigService, redisService: RedisService) => {
        const redisInstance = redisService.getClient('SUBSCRIPTION');

        return new RedisPubSub({
          publisher: redisInstance,
          subscriber: redisInstance,
        });
      },
    },
  ],

  exports: ['PUB_SUB'],
})
export class SubscriptionsModule {}
