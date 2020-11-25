/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { LdapService } from 'nestjs-ldap';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config/config.service';
import { ImageService } from '@app/image';
import { GroupService } from '@back/group/group.service';
import { ProfileService } from './profile.service';
import { GroupEntity } from '../group/group.entity';
import { UserEntity } from '../user/user.entity';
import { UserEntityMock } from '../user/user.entity.mock';
import { ProfileEntity } from './profile.entity';
//#endregion

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));
const repositoryMock = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

describe('ProfileService', () => {
  let service: ProfileService;

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
        // TypeOrmModule.forFeature([GroupEntity]),
      ],
      providers: [
        { provide: Logger, useValue: serviceMock },
        ConfigService,
        ProfileService,
        { provide: LdapService, useValue: serviceMock },
        { provide: GroupService, useValue: serviceMock },
        { provide: ImageService, useValue: serviceMock },
        { provide: getRepositoryToken(GroupEntity), useValue: repositoryMock },
        { provide: getRepositoryToken(UserEntity), useValue: UserEntityMock },
        { provide: getRepositoryToken(ProfileEntity), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
