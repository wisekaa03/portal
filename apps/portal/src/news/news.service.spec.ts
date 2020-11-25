/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

//#region Imports NPM
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { NewsService } from './news.service';
import { ProfileService } from '../profile/profile.service';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { UserEntityMock } from '../user/user.entity.mock';
import { GroupEntity } from '../group/group.entity';
import { ProfileEntity } from '../profile/profile.entity';
import { NewsEntity } from './news.entity';
import { NewsEntityMock } from './news.entity.mock';
//#endregion

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));
const repositoryMock = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

describe(NewsService.name, () => {
  let service: NewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () =>
            ({
              type: 'sqlite',
              database: ':memory:',
              dropSchema: true,
              entities: [NewsEntityMock, GroupEntity, UserEntityMock, ProfileEntity],
              synchronize: true,
              logging: false,
            } as TypeOrmModuleOptions),
        }),
      ],
      providers: [
        { provide: Logger, useValue: serviceMock },
        ConfigService,
        NewsService,
        { provide: UserService, useValue: serviceMock },
        { provide: ProfileService, useValue: serviceMock },
        { provide: getRepositoryToken(GroupEntity), useValue: repositoryMock },
        { provide: getRepositoryToken(UserEntity), useValue: UserEntityMock },
        { provide: getRepositoryToken(ProfileEntity), useValue: repositoryMock },
        { provide: getRepositoryToken(NewsEntity), useValue: NewsEntityMock },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
