/** @format */

// #region Imports NPM
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule, QueryResolver, HeaderResolver } from 'nestjs-i18n';
// #endregion
// #region Imports Local
import { JwtService, JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { UserService } from './user.service';
import { ConfigModule } from '../config/config.module';
import { UserEntity } from './user.entity';
import { LdapModule } from '../ldap/ldap.module';
import { Scope } from '../ldap/interfaces/ldap.interface';
import { ConfigService } from '../config/config.service';
import { LogServiceMock } from '../../__mocks__/logger.service.mock';
import { LogService } from '../logger/logger.service';
import { AuthService } from '../auth/auth.service';
import { JwtServiceMock } from '../../__mocks__/jwt.service.mock';
// #endregion

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        // LoggerModule,

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

        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              ...configService.jwtModuleOptions,
            } as JwtModuleOptions;
          },
        }),

        LdapModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              url: configService.get('LDAP_URL'),
              bindDN: configService.get('LDAP_BIND_DN'),
              bindCredentials: configService.get('LDAP_BIND_PW'),
              searchBase: configService.get('LDAP_SEARCH_BASE'),
              searchFilter: configService.get('LDAP_SEARCH_FILTER'),
              searchScope: 'sub' as Scope,
              searchAttributes: ['*'],
              reconnect: true,
            };
          },
        }),
      ],
      providers: [
        UserService,
        AuthService,
        { provide: LogService, useClass: LogServiceMock },
        // { provide: AuthService, useClass: AuthService },
        { provide: JwtService, useClass: JwtServiceMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
