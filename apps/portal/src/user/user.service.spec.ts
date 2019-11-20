/** @format */
/* eslint spaced-comment:0, prettier/prettier:0 */

// #region Imports NPM
import { resolve } from 'path';
import { TypeOrmModule, getRepositoryToken, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule } from 'nestjs-i18n';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { UserService } from './user.service';
import { ConfigModule } from '../config/config.module';
import { UserEntity } from './user.entity';
import { LoggerModule } from '../logger/logger.module';
import { LdapModule } from '../ldap/ldap.module';
import { LdapModuleOptions } from '../ldap/ldap.interface';
import { ProfileModule } from '../profile/profile.module';
import { LdapService } from '../ldap/ldap.service';
import { ProfileEntity } from '../profile/profile.entity';
import { SYNCHRONIZATION_SERVICE } from '../../../synch/src/app.constants';
import { ConfigService } from '../config/config.service';
import { LogService } from '../logger/logger.service';
// #endregion

const mockRepository = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

jest.mock('./user.entity');
jest.mock('../profile/profile.entity');
jest.mock('../ldap/ldap.service');
jest.mock('../guards/gqlauth.guard');

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        ConfigModule.register(resolve(__dirname, '../../../..', '.env')),

        I18nModule.forRootAsync({
          useFactory: () => ({
            path: __dirname,
            filePattern: '*.json',
            fallbackLanguage: 'en',
          }),
        }),

        TypeOrmModule.forRoot({}),
        // TypeOrmModule.forFeature([UserEntity]),

        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),

        ClientsModule.register([
          {
            name: SYNCHRONIZATION_SERVICE,
            transport: Transport.NATS,
            // options: {
            //   url: configService.get<string>('MICROSERVICE_URL'),
            //   user: configService.get<string>('MICROSERVICE_USER'),
            //   pass: configService.get<string>('MICROSERVICE_PASS'),
            // },
          },
        ]),

        ProfileModule,
      ],
      providers: [
        UserService,
        LdapService,
        // { provide: ClientProxy, useValue: ClientProxy },
        { provide: getRepositoryToken(UserEntity), useValue: mockRepository },
        { provide: getRepositoryToken(ProfileEntity), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
