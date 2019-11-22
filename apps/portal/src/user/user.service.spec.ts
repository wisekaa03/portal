/** @format */
/* eslint spaced-comment:0, prettier/prettier:0 */

// #region Imports NPM
import { resolve } from 'path';
import { TypeOrmModule, getRepositoryToken, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule } from 'nestjs-i18n';
import { ClientsModule, Transport } from '@nestjs/microservices';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule, LogService } from '@app/logger';
import { LdapModule, LdapService, LdapModuleOptions } from '@app/ldap';
import { SYNCHRONIZATION_SERVICE } from '../../../synch/src/app.constants';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { ProfileModule } from '../profile/profile.module';
import { ProfileEntity } from '../profile/profile.entity';
// #endregion

const mockRepository = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

jest.mock('@app/ldap/ldap.service');
jest.mock('../guards/gqlauth.guard');

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV === 'test';
const env = resolve(__dirname, dev ? (test ? '../../../..' : '../../..') : '../../..', '.env');

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        ConfigModule.register(env),

        I18nModule.forRootAsync({
          useFactory: () => ({
            path: __dirname,
            filePattern: '*.json',
            fallbackLanguage: 'en',
          }),
        }),

        TypeOrmModule.forRootAsync({
          imports: [ConfigModule, LoggerModule],
          inject: [ConfigService, LogService],
          useFactory: async (configService: ConfigService, logger: LogService) =>
            ({
              name: 'default',
              keepConnectionAlive: true,
              type: configService.get<string>('DATABASE_CONNECTION'),
              host: configService.get<string>('DATABASE_HOST'),
              port: configService.get<number>('DATABASE_PORT'),
              username: configService.get<string>('DATABASE_USERNAME'),
              password: configService.get<string>('DATABASE_PASSWORD'),
              database: configService.get<string>('DATABASE_DATABASE'),
              schema: configService.get<string>('DATABASE_SCHEMA'),
              uuidExtension: 'pgcrypto',
              logger,
              synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE'),
              dropSchema: configService.get<boolean>('DATABASE_DROP_SCHEMA'),
              logging: true,
              entities: [ProfileEntity, UserEntity],
              migrationsRun: configService.get<boolean>('DATABASE_MIGRATIONS_RUN'),
              cache: false,
            } as TypeOrmModuleOptions),
        }),
        TypeOrmModule.forFeature([UserEntity]),

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
