/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule, QueryResolver, HeaderResolver } from 'nestjs-i18n';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LdapModule, LdapModuleOptions } from '@app/ldap';
import { LoggerModule } from '@app/logger';
import { HttpModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
// #endregion

const UserServiceMock = jest.fn(() => ({}));

jest.mock('@app/logger/logger.service');
jest.mock('@app/ldap/ldap.service');
jest.mock('../user/user.service');

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV === 'test';
const env = resolve(__dirname, dev ? (test ? '../../../..' : '../../..') : '../../..', '.env');

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        ConfigModule.register(env),

        HttpModule,

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

        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),
      ],
      providers: [AuthService, { provide: UserService, useValue: UserServiceMock }],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
