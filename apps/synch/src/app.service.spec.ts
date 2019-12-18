/** @format */
/* eslint max-classes-per-file:0 */

// #region Imports NPM
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nModule } from 'nestjs-i18n';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule, LogService } from '@app/logger';
import { LdapModule, LdapService, LdapModuleOptions } from '@app/ldap';
import { UserModule } from '../../portal/src/user/user.module';
import { SynchService } from './app.service';
// #endregion

@Entity()
class UserEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

@Entity()
class ProfileEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

@Entity()
class GroupEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

jest.mock('@app/ldap/ldap.service');
jest.mock('@app/image/image.service');
jest.mock('../../portal/src/user/user.service');
jest.mock('../../portal/src/profile/profile.service');
jest.mock('../../portal/src/group/group.service');

jest.mock('@app/logger/logger.service', () => ({
  LogService: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));
// jest.mock('@app/config/config.service');

describe('Synch service', () => {
  let libs: SynchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        ConfigModule.register('.env'),

        I18nModule.forRootAsync({
          useFactory: () => ({
            path: __dirname,
            filePattern: '*.json',
            fallbackLanguage: 'en',
          }),
        }),

        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),

        // #region TypeORM
        /* eslint-disable prettier/prettier */
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
            type: 'sqlite',
            database: ':memory:',
            dropSchema: true,
            entities: [ProfileEntity, GroupEntity, UserEntity],
            synchronize: true,
            logging: false
          } as TypeOrmModuleOptions),
        }),
        /* eslint-enable prettier/prettier */
        // #endregion

        UserModule,
      ],
      providers: [SynchService],
    }).compile();

    libs = module.get<SynchService>(SynchService);
  });

  it('should be defined', () => {
    expect(libs).toBeDefined();
  });
});
