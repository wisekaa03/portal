/** @format */

//#region Imports NPM
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transport, ClientProxyFactory } from '@nestjs/microservices';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { LDAP_SYNC_SERVICE } from '@back/shared/constants';
import { ProfileModule } from '@back/profile/profile.module';
import { GroupModule } from '@back/group/group.module';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
//#endregion

@Module({
  imports: [
    GroupModule,
    ProfileModule,

    //#region TypeORM
    TypeOrmModule.forFeature([UserEntity]),
    //#endregion
  ],
  controllers: [],
  providers: [
    Logger,
    UserService,
    UserResolver,

    {
      provide: LDAP_SYNC_SERVICE,
      useFactory: (configService: ConfigService) => {
        const microservice = configService.get<string>('MICROSERVICE_URL');
        if (microservice) {
          return ClientProxyFactory.create({
            transport: Transport.REDIS,
            options: {
              url: microservice,
            },
          });
        }

        return null;
      },
      inject: [ConfigService],
    },
  ],
  exports: [UserService],
})
export class UserModule {}
