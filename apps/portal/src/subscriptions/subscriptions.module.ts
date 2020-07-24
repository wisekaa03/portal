/** @format */
/// <reference types="../../../../typings/global" />

//#region Imports NPM
import { Module } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
//#endregion
//#region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { PingPongResolvers } from './ping.resolver';
//#endregion

@Module({
  imports: [
    //#region Config module
    ConfigModule,
    //#endregion
  ],

  providers: [
    PingPongResolvers,
    {
      provide: 'PUB_SUB',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('HTTP_REDIS_URI')?.replace(/^redis:\/\/(.*?):(\d+)\/(\d+)$/, '$1');
        const redisOptions = {
          host,
        };

        return new RedisPubSub({
          publisher: new Redis(redisOptions),
          subscriber: new Redis(redisOptions),
        });
      },
    },
  ],

  exports: ['PUB_SUB'],
})
export class SubscriptionsModule {}
