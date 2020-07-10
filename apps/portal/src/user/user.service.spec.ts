/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

//#region Imports NPM
import { TypeOrmModule, getRepositoryToken, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { getLoggerToken } from 'nestjs-pino';
import { LdapService } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { LDAP_SYNC_SERVICE } from '@lib/constants';
import { ProfileService } from '@back/profile/profile.service';
import { ProfileEntity } from '@back/profile/profile.entity';
import { GroupService } from '@back/group/group.service';
import { GroupEntity } from '@back/group/group.entity';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { UserEntityMock } from './user.entity.mock';
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
        TypeOrmModule.forRootAsync({
          useFactory: async () =>
            ({
              type: 'sqlite',
              database: ':memory:',
              dropSchema: true,
              entities: [GroupEntity, UserEntityMock, ProfileEntity],
              synchronize: true,
              logging: false,
            } as TypeOrmModuleOptions),
        }),
      ],
      providers: [
        { provide: LDAP_SYNC_SERVICE, useValue: serviceMock },
        { provide: getLoggerToken(UserService.name), useValue: serviceMock },
        ConfigService,
        UserService,
        { provide: ClientProxy, useValue: serviceMock },
        { provide: LdapService, useValue: serviceMock },
        { provide: ProfileService, useValue: serviceMock },
        { provide: GroupService, useValue: serviceMock },
        { provide: getRepositoryToken(GroupEntity), useValue: repositoryMock },
        { provide: getRepositoryToken(UserEntity), useValue: UserEntityMock },
        { provide: getRepositoryToken(ProfileEntity), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
