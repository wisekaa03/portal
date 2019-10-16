/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService, JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { I18nModule } from 'nestjs-i18n';
import { UserResolver } from './user.resolver';
import { UserModule } from './user.module';
import { LogService } from '../logger/logger.service';
import { LogServiceMock } from '../../__mocks__/logger.service.mock';
import { AuthService } from '../auth/auth.service';
import { AuthServiceMock } from '../../__mocks__/auth.service.mock';
import { JwtServiceMock } from '../../__mocks__/jwt.service.mock';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { CookieSerializer } from '../auth/cookie.serializer';
import { CookieSerializerMock } from '../../__mocks__/cookie.serializer.mock';
import { UserService } from './user.service';
import { UserServiceMock } from '../../__mocks__/user.service.mock';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { GqlAuthGuardMock } from '../../__mocks__/gqlauth.guard.mock';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { JwtStrategyMock } from '../../__mocks__/jwt.strategy.mock';
// #endregion

describe('UserResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        UserModule,

        I18nModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            path: configService.i18nPath,
            filePattern: configService.i18nFilePattern,
            fallbackLanguage: configService.fallbackLanguage,
          }),
        }),

        TypeOrmModule.forRoot({}),

        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              ...configService.jwtModuleOptions,
            } as JwtModuleOptions;
          },
        }),
      ],
      providers: [
        UserResolver,
        { provide: UserService, useValue: UserServiceMock },
        { provide: AuthService, useValue: AuthServiceMock },
        { provide: JwtService, useValue: JwtServiceMock },
      ],
    })
      .overrideProvider(LogService)
      .useValue(LogServiceMock)
      .overrideProvider(JwtStrategy)
      .useValue(JwtStrategyMock)
      .overrideProvider(CookieSerializer)
      .useValue(CookieSerializerMock)
      .overrideGuard(GqlAuthGuard)
      .useValue(GqlAuthGuardMock)
      .compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
