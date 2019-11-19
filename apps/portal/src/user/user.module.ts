/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../logger/logger.module';
import { ProfileModule } from '../profile/profile.module';
import { UserResolver } from './user.resolver';
import { SYNCHRONIZATION_SERVICE } from '../../../synch/src/app.constants';
// #endregion

@Module({
  imports: [
    // #region Config module
    ConfigModule,
    LoggerModule,
    // #endregion

    // #region TypeORM
    TypeOrmModule.forFeature([UserEntity]),
    // #endregion

    // #region Microservice client
    ClientsModule.register([
      {
        name: SYNCHRONIZATION_SERVICE,
        transport: Transport.NATS,
        // options: {
        //   url: configService.get<string>('MICROSERVICE_URL'),
        //   user: configService.get<string>('MICROSERVICE_USER'),
        //   pass: configService.get<string>('MICROSERVICE_PASS'),
        // },
      },
    ]),
    // #endregion

    ProfileModule,
  ],
  controllers: [],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
