/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService, JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { I18nModule } from 'nestjs-i18n';
import { LogService } from '../logger/logger.service';
import { LogServiceMock } from '../../__mocks__/logger.service.mock';
import { AuthService } from '../auth/auth.service';
import { AuthServiceMock } from '../../__mocks__/auth.service.mock';
import { JwtServiceMock } from '../../__mocks__/jwt.service.mock';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { UserServiceMock } from '../../__mocks__/user.service.mock';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { JwtStrategyMock } from '../../__mocks__/jwt.strategy.mock';
import { AuthResolver } from '../auth/auth.resolver';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { LdapModule } from '../ldap/ldap.module';
import { LdapService } from '../ldap/ldap.service';
import { LdapServiceMock } from '../../__mocks__/ldap.service.mock';
import { LdapModuleOptions } from '../ldap/interfaces/ldap.interface';
import { ProfileModule } from '../profile/profile.module';
import { UserEntity } from './user.entity';
import { LoggerModule } from '../logger/logger.module';
import { UserResolver } from './user.resolver';
import { ProfileEntity } from '../profile/profile.entity';
import { MockRepository } from '../../__mocks__/mockRepository.mock';
// #endregion

jest.mock('../logger/logger.service');
jest.mock('../ldap/ldap.service');
jest.mock('../guards/gqlauth.guard');

describe('UsersResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
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

        // #region Config module
        ConfigModule,
        LoggerModule,
        // #endregion

        LdapModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: () => {
            return {} as LdapModuleOptions;
          },
        }),

        // #region TypeORM
        TypeOrmModule.forFeature([UserEntity]),
        // #endregion

        ProfileModule,
      ],
      providers: [
        UserResolver,
        { provide: UserService, useValue: UserServiceMock },
        { provide: AuthService, useValue: AuthServiceMock },
        // { provide: LdapService, useValue: LdapServiceMock },
        { provide: JwtService, useValue: JwtServiceMock },
        { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        { provide: getRepositoryToken(ProfileEntity), useValue: MockRepository },
      ],
    })
      .overrideProvider(LogService)
      .useValue(LogServiceMock)
      .overrideProvider(JwtStrategy)
      .useValue(JwtStrategyMock)
      .overrideProvider(LdapService)
      .useValue(LdapServiceMock)
      .compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
