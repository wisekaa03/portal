/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transport, ClientProxyFactory } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule } from '@app/logger';
import { LDAP_SYNC_SERVICE } from '@lib/constants';
import { ProfileModule } from '@back/profile/profile.module';
import { GroupModule } from '@back/group/group.module';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
// #endregion

@Module({
  imports: [
    // #region Config & Log module
    ConfigModule,
    LoggerModule,
    // #endregion

    GroupModule,
    ProfileModule,

    // #region TypeORM
    TypeOrmModule.forFeature([UserEntity]),
    // #endregion
  ],
  controllers: [],
  providers: [
    UserService,
    UserResolver,

    {
      provide: LDAP_SYNC_SERVICE,
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: {
            url: configService.get<string>('MICROSERVICE_URL'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [UserService],
})
export class UserModule {}
