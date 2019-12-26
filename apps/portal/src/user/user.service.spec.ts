/** @format */
/* eslint spaced-comment:0, prettier/prettier:0, max-classes-per-file:0 */

// #region Imports NPM
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
// import { I18nModule } from 'nestjs-i18n';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { LdapModule, LdapService, LdapModuleOptions } from '@app/ldap';
import { SYNCHRONIZATION_SERVICE } from '../../../synch/src/app.constants';
import { UserService } from './user.service';
import { ProfileModule } from '../profile/profile.module';
import { GroupModule } from '../group/group.module';
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
jest.mock('../guards/gqlauth.guard');
// jest.mock('@app/config/config.service');

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        // ConfigModule.register('.env'),

        TypeOrmModule.forRootAsync({
          useFactory: async () =>
            ({
              type: 'sqlite',
              database: ':memory:',
              dropSchema: true,
              entities: [ProfileEntity, GroupEntity, UserEntity],
              synchronize: true,
              logging: false
            } as TypeOrmModuleOptions),
        }),
        TypeOrmModule.forFeature([UserEntity]),

        LdapModule.registerAsync({
          useFactory: () => ({} as LdapModuleOptions),
        }),

        ClientsModule.register([
          {
            name: SYNCHRONIZATION_SERVICE,
            transport: Transport.REDIS,
          },
        ]),

        GroupModule,
        ProfileModule,
      ],
      providers: [
        UserService,
        LdapService,
        // { provide: ClientProxy, useValue: ClientProxy },
        // { provide: getRepositoryToken(UserEntity), useValue: mockRepository },
        // { provide: getRepositoryToken(ProfileEntity), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
