/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { ConfigModule } from '../config/config.module';
import { LoggerModule } from '../logger/logger.module';
import { ProfileModule } from '../profile/profile.module';
import { UserResolver } from './user.resolver';
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

    ProfileModule,
  ],
  controllers: [],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
