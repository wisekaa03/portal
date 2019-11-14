/** @format */

// #region Imports NPM
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule } from 'nestjs-i18n';
// #endregion
// #region Imports Local
import { UserService } from './user.service';
import { ConfigModule } from '../config/config.module';
import { UserEntity } from './user.entity';
import { LoggerModule } from '../logger/logger.module';
import { LdapModule } from '../ldap/ldap.module';
import { LdapModuleOptions } from '../ldap/interfaces/ldap.interface';
import { ProfileModule } from '../profile/profile.module';
import { LdapService } from '../ldap/ldap.service';
import { ProfileEntity } from '../profile/profile.entity';
// #endregion

jest.mock('../guards/gqlauth.guard');
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

        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),

        ProfileModule,
      ],
      providers: [
        UserService,
        LdapService,
        // { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        // { provide: getRepositoryToken(ProfileEntity), useValue: MockRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
