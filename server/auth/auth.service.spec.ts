/** @format */

// #region Imports NPM
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
// #endregion
// #region Imports Local
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { LoggerModule } from '../logger/logger.module';
import { ProfileEntity } from '../profile/profile.entity';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { UserEntity } from '../user/user.entity';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { UserServiceMock } from '../../__mocks__/user.service.mock';
import { GqlAuthGuardMock } from '../../__mocks__/gqlauth.guard.mock';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { MockRepository } from '../../__mocks__/mockRepository.mock';
// #endregion

jest.mock('../logger/logger.service');
jest.mock('../ldap/ldap.service');

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        LoggerModule,

        I18nModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            path: configService.i18nPath,
            filePattern: configService.i18nFilePattern,
            fallbackLanguage: configService.fallbackLanguage,
            resolvers: [new QueryResolver(['lang', 'locale', 'l']), new HeaderResolver()],
          }),
        }),

        TypeOrmModule.forRoot({}),
        TypeOrmModule.forFeature([UserEntity]),
        TypeOrmModule.forFeature([ProfileEntity]),

        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              ...configService.jwtModuleOptions,
            } as JwtModuleOptions;
          },
        }),

        AuthModule,
        UserModule,
      ],
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        { provide: getRepositoryToken(ProfileEntity), useValue: MockRepository },
        { provide: UserService, useValue: UserServiceMock },
      ],
    })
      .overrideGuard(GqlAuthGuard)
      .useValue(GqlAuthGuardMock)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
