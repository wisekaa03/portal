/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

// #region Imports NPM
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config/config.service';
import { LdapService } from '@app/ldap';
import { LDAP_SYNC_SERVICE } from '@lib/constants';
import { ProfileService } from '@back/profile/profile.service';
import { GroupService } from '@back/group/group.service';
import { UserService } from './user.service';
// #endregion

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));
const repositoryMock = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

@Entity()
class UserEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(),
        TypeOrmModule.forRootAsync({
          useFactory: async () =>
            ({
              type: 'sqlite',
              database: ':memory:',
              dropSchema: true,
              entities: [UserEntity],
              synchronize: true,
              logging: false,
            } as TypeOrmModuleOptions),
        }),
        TypeOrmModule.forFeature([UserEntity]),
      ],
      providers: [
        ConfigService,
        UserService,
        { provide: LDAP_SYNC_SERVICE, useValue: serviceMock },
        { provide: ClientProxy, useValue: serviceMock },
        { provide: LdapService, useValue: serviceMock },
        { provide: ProfileService, useValue: serviceMock },
        { provide: GroupService, useValue: serviceMock },
        { provide: getRepositoryToken(UserEntity), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
