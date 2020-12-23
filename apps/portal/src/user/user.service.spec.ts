/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

//#region Imports NPM
import { Logger } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken, TypeOrmModuleOptions } from '@nestjs/typeorm';
// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { LdapService, LdapModule, LDAP_OPTIONS } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LDAP_SYNC_SERVICE } from '@back/shared/constants';
import { ProfileService, Profile } from '@back/profile';
import { GroupService, Group } from '@back/group';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ProfileModule } from '../profile/profile.module';
//#endregion

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));
const repositoryMock = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

describe(UserService.name, () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // ConfigModule.register(join('../../.env.example')),
        // TypeOrmModule.forRootAsync({
        //   useFactory: async () =>
        //     ({
        //       type: 'sqlite',
        //       database: ':memory:',
        //       dropSchema: true,
        //       entities: [Group, UserMock, ProfileMock],
        //       synchronize: true,
        //       logging: false,
        //     } as TypeOrmModuleOptions),
        // }),
        // TypeOrmModule.forFeature([UserMock]),
        // LdapModule.register({
        //   domains: [],
        //   logger: console,
        // }),
        // ProfileModule,
      ],
      providers: [
        { provide: LDAP_SYNC_SERVICE, useValue: serviceMock },
        { provide: LDAP_OPTIONS, useValue: serviceMock },
        { provide: Logger, useValue: serviceMock },
        ConfigService,
        UserService,
        { provide: GroupService, useValue: serviceMock },
        { provide: ProfileService, useValue: serviceMock },
        { provide: ClientProxy, useValue: serviceMock },
        { provide: LdapService, useValue: serviceMock },
        { provide: getRepositoryToken(User), useClass: repositoryMock },
        { provide: getRepositoryToken(Profile), useClass: repositoryMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
