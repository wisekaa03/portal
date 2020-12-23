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
import { GroupService, Group } from '@back/group';
import { User } from '../user/user.entity';
import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';
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
        // TypeOrmModule.forFeature([Group, UserMock, ProfileMock]),
      ],
      providers: [
        { provide: Logger, useValue: serviceMock },
        ConfigService,
        ProfileService,
        { provide: LdapService, useValue: serviceMock },
        { provide: GroupService, useValue: serviceMock },
        { provide: ImageService, useValue: serviceMock },
        { provide: getRepositoryToken(User), useClass: repositoryMock },
        { provide: getRepositoryToken(Profile), useClass: repositoryMock },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
