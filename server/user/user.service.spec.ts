/** @format */

// #region Imports NPM
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule } from 'nestjs-i18n';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
// #endregion
// #region Imports Local
import { UserService } from './user.service';
import { ConfigModule } from '../config/config.module';
import { UserEntity } from './user.entity';
import { LoggerModule } from '../logger/logger.module';
import { LdapModule } from '../ldap/ldap.module';
import { LdapModuleOptions } from '../ldap/interfaces/ldap.interface';
import { ProfileModule } from '../profile/profile.module';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { GqlAuthGuardMock } from '../../__mocks__/gqlauth.guard.mock';
import { LdapService } from '../ldap/ldap.service';
import { LdapServiceMock } from '../../__mocks__/ldap.service.mock';
import { MockRepository } from '../../__mocks__/mockRepository.mock';
import { ProfileEntity } from '../profile/profile.entity';
// #endregion

jest.mock('../ldap/ldap.service');
jest.mock('../guards/gqlauth.guard');

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        LoggerModule,

        I18nModule.forRootAsync({
          useFactory: () => ({
            path: __dirname,
            filePattern: '*.json',
            fallbackLanguage: 'en',
          }),
        }),

        TypeOrmModule.forRoot({}),
        TypeOrmModule.forFeature([UserEntity]),

        JwtModule.registerAsync({
          useFactory: () => {
            return {} as JwtModuleOptions;
          },
        }),

        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),

        ProfileModule,
      ],
      providers: [
        UserService,
        { provide: LdapService, useValue: LdapServiceMock },
        { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        { provide: getRepositoryToken(ProfileEntity), useValue: MockRepository },
      ],
    })
      .overrideProvider(LdapService)
      .useValue(LdapServiceMock)
      .overrideGuard(GqlAuthGuard)
      .useValue(GqlAuthGuardMock)
      .compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
