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
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
// #endregion

const UserServiceMock = jest.fn(() => ({}));

// jest.mock('@nestjs/typeorm/dist/typeorm.module');
jest.mock('@app/logger/logger.service');
jest.mock('@app/ldap/ldap.service');
jest.mock('../shared/session-redis');
jest.mock('../user/user.service');
// jest.mock('../profile/profile.service');

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
    })
      .overrideProvider(UserService)
      .useValue(UserServiceMock)
      .compile();

    service = module.get<AuthService>(AuthService);
    // repositoryMock = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
