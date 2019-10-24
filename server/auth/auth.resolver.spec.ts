/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { I18nModule } from 'nestjs-i18n';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { UserServiceMock } from '../../__mocks__/user.service.mock';
import { AuthResolver } from './auth.resolver';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { LdapModule } from '../ldap/ldap.module';
import { LdapService } from '../ldap/ldap.service';
import { LdapServiceMock } from '../../__mocks__/ldap.service.mock';
import { LdapModuleOptions } from '../ldap/interfaces/ldap.interface';
import { UserEntity } from '../user/user.entity';
import { ProfileEntity } from '../profile/profile.entity';
import { MockRepository } from '../../__mocks__/mockRepository.mock';
import { AuthService } from '../../../../../../../wisekaa03/Документы/KNGK/Portal/portal/server/auth/auth.service';
// #endregion

jest.mock('../ldap/ldap.service');
jest.mock('../guards/gqlauth.guard');

describe('AuthResolver', () => {
  let resolver: AuthResolver;

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

        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),

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
        AuthResolver,
        AuthService,
        { provide: UserService, useValue: UserServiceMock },
        { provide: LdapService, useValue: LdapServiceMock },
        { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        { provide: getRepositoryToken(ProfileEntity), useValue: MockRepository },
      ],
    })
      .overrideProvider(LdapService)
      .useValue(LdapServiceMock)
      .compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
