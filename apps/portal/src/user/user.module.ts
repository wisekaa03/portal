/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transport, ClientProxyFactory } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule } from '@app/logger';
import { SYNCHRONIZATION_SERVICE } from '../../../synch/src/app.constants';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { ProfileModule } from '../profile/profile.module';
import { UserResolver } from './user.resolver';
// #endregion

@Module({
  imports: [
    // #region Config & Log module
    ConfigModule,
    LoggerModule,
    // #endregion

    // #region TypeORM
    TypeOrmModule.forFeature([UserEntity]),
    // #endregion

    ProfileModule,
  ],
  controllers: [],
  providers: [
    UserService,
    UserResolver,

    {
      provide: SYNCHRONIZATION_SERVICE,
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            url: configService.get<string>('MICROSERVICE_URL'),
            user: configService.get<string>('MICROSERVICE_USER'),
            pass: configService.get<string>('MICROSERVICE_PASS'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [UserService],
})
export class UserModule {}
