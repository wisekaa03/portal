/** @format */

// #region Imports NPM
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule, I18nService } from 'nestjs-i18n';
import { JwtService, JwtModule, JwtModuleOptions } from '@nestjs/jwt';
// #endregion
// #region Imports Local
import { UserService } from './user.service';
import { ConfigModule } from '../config/config.module';
import { UserEntity } from './user.entity';
import { LoggerModule } from '../logger/logger.module';
import { LdapModule } from '../ldap/ldap.module';
import { LdapModuleOptions } from '../ldap/interfaces/ldap.interface';
// import { ConfigService } from '../config/config.service';
import { LogService } from '../logger/logger.service';
import { LogServiceMock } from '../../__mocks__/logger.service.mock';
import { JwtServiceMock } from '../../__mocks__/jwt.service.mock';
// import { ProfileEntity } from '../profile/profile.entity';
import { ProfileModule } from '../profile/profile.module';
// import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { AuthServiceMock } from '../../__mocks__/auth.service.mock';
// import { CookieSerializer } from '../auth/cookie.serializer';
// import { CookieSerializerMock } from '../../__mocks__/cookie.serializer.mock';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { GqlAuthGuardMock } from '../../__mocks__/gqlauth.guard.mock';
import { LdapService } from '../ldap/ldap.service';
import { LdapServiceMock } from '../../__mocks__/ldap.service.mock';
import { I18nServiceMock } from '../../__mocks__/i18n.service.mock';
// #endregion

jest.mock('../logger/logger.service');
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
        I18nService,
        { provide: AuthService, useValue: AuthServiceMock },
        // { provide: JwtService, useValue: JwtServiceMock },
      ],
    })
      .overrideProvider(LogService)
      .useValue(LogServiceMock)
      .overrideProvider(LdapService)
      .useValue(LdapServiceMock)
      .overrideProvider(JwtService)
      .useValue(JwtServiceMock)
      .overrideProvider(I18nService)
      .useValue(I18nServiceMock)
      .overrideGuard(GqlAuthGuard)
      .useValue(GqlAuthGuardMock)
      .compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
