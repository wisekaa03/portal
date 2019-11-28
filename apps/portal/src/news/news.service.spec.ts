/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
// import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { LdapModule, LdapService, LdapModuleOptions } from '@app/ldap';
import { ImageModule } from '@app/image';
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule, LogService } from '@app/logger';
import { NewsService } from './news.service';
// import { NewsEntity } from './news.entity';
// #endregion

const mockRepository = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

const LdapServiceMock = jest.fn(() => ({}));

// jest.mock('@nestjs/typeorm/dist/typeorm.module');
jest.mock('@app/ldap/ldap.service');
jest.mock('../guards/gqlauth.guard');

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV === 'test';
const env = resolve(__dirname, dev ? (test ? '../../../..' : '../../..') : '../../..', '.env');

describe('NewsService', () => {
  let service: NewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        ConfigModule.register(env),

        ImageModule,

        // TypeOrmModule.forRootAsync({
        //   imports: [ConfigModule, LoggerModule],
        //   inject: [ConfigService, LogService],
        //   useFactory: async (configService: ConfigService, logger: LogService) =>
        //     ({
        //       name: 'default',
        //       keepConnectionAlive: true,
        //       type: configService.get<string>('DATABASE_CONNECTION'),
        //       host: configService.get<string>('DATABASE_HOST'),
        //       port: configService.get<number>('DATABASE_PORT'),
        //       username: configService.get<string>('DATABASE_USERNAME'),
        //       password: configService.get<string>('DATABASE_PASSWORD'),
        //       database: configService.get<string>('DATABASE_DATABASE'),
        //       schema: configService.get<string>('DATABASE_SCHEMA'),
        //       uuidExtension: 'pgcrypto',
        //       logger,
        //       synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE'),
        //       dropSchema: configService.get<boolean>('DATABASE_DROP_SCHEMA'),
        //       logging: true,
        //       entities: [NewsEntity /* UserEntity */],
        //       migrationsRun: configService.get<boolean>('DATABASE_MIGRATIONS_RUN'),
        //       cache: false,
        //     } as TypeOrmModuleOptions),
        // }),
        // TypeOrmModule.forFeature([NewsEntity]),

        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),
      ],
      providers: [
        NewsService,
        { provide: LdapService, useValue: LdapServiceMock },
        // { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        // { provide: getRepositoryToken(NewsEntity), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
