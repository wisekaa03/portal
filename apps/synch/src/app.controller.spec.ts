/** @format */
/* eslint prettier/prettier:0 */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LogService, LoggerModule } from '@app/logger';
import { ConfigModule, ConfigService } from '@app/config';
import { LdapModule, LdapModuleOptions } from '@app/ldap';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../../portal/src/user/user.module';
import { ProfileEntity } from '../../portal/src/profile/profile.entity';
import { UserEntity } from '../../portal/src/user/user.entity';
// #endregion

const mockRepository = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

// jest.mock('@app/config/config.service');
jest.mock('@app/logger/logger.service');
jest.mock('@app/ldap/ldap.service');
jest.mock('../../portal/src/user/user.service');
jest.mock('./app.service');

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV === 'test';
const env = resolve(__dirname, dev ? (test ? '../../..' : '../../..') : '../../..', '.env');

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      imports: [
        LoggerModule,
        ConfigModule.register(env),

        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
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
        // TypeOrmModule.forFeature([UserEntity]),

        UserModule,
      ],
      providers: [
        AppService,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepository },
        { provide: getRepositoryToken(ProfileEntity), useValue: mockRepository },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });
});
