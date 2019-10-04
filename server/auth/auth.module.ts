/** @format */

// #region Imports NPM
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
// #endregion
// #region Imports Local
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
// eslint-disable-next-line import/no-cycle
import { UserModule } from '../user/user.module';
import { NextModule } from '../next/next.module';
import { UserEntity } from '../user/user.entity';
import { LoggerModule } from '../logger/logger.module';
import { CookieSerializer } from './cookie.serializer';
// #endregion

@Module({
  imports: [
    // #region Logger module, Config module, Next module
    LoggerModule,
    ConfigModule,
    NextModule,
    // #endregion

    // #region TypeOrmModule
    // TypeOrmModule.forFeature([UserEntity]),
    // #endregion

    // #region Passport module
    PassportModule.register({ defaultStrategy: 'jwt', session: true }),
    // #endregion

    // #region Jwt module
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          ...configService.jwtModuleOptions,
        } as JwtModuleOptions;
      },
    }),
    // #endregion

    // #region Users module
    forwardRef(() => UserModule),
    // #endregion
  ],
  providers: [AuthService, JwtStrategy, CookieSerializer],
  exports: [PassportModule, JwtModule, AuthService],
})
export class AuthModule {}
