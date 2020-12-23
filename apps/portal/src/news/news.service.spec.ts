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
import { User } from '../user/user.entity';
import { Profile } from '../profile/profile.entity';
import { News } from './news.entity';
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
        // TypeOrmModule.forRootAsync({
        //   useFactory: async () =>
        //     ({
        //       type: 'sqlite',
        //       database: ':memory:',
        //       dropSchema: true,
        //       entities: [NewsMock, Group, UserMock, ProfileMock],
        //       synchronize: true,
        //       logging: false,
        //     } as TypeOrmModuleOptions),
        // }),
        // TypeOrmModule.forFeature([News]),
      ],
      providers: [
        { provide: Logger, useValue: serviceMock },
        ConfigService,
        NewsService,
        { provide: UserService, useValue: serviceMock },
        { provide: ProfileService, useValue: serviceMock },
        { provide: getRepositoryToken(News), useClass: repositoryMock },
        { provide: getRepositoryToken(User), useClass: repositoryMock },
        { provide: getRepositoryToken(Profile), useClass: repositoryMock },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
