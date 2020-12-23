/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

//#region Imports NPM
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
//#endregion
//#region Imports Local
import { ConfigService } from '../../../../libs/config/src';
import { GroupService } from './group.service';
import { Group } from './group.entity';
//#endregion

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));
const repositoryMock = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

describe(GroupService.name, () => {
  let service: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // TypeOrmModule.forRootAsync({
        //   useFactory: async () =>
        //     ({
        //       type: 'sqlite',
        //       database: ':memory:',
        //       dropSchema: true,
        //       entities: [Group],
        //       synchronize: true,
        //       logging: false,
        //     } as TypeOrmModuleOptions),
        // }),
        // TypeOrmModule.forFeature([Group]),
      ],
      providers: [
        { provide: Logger, useValue: serviceMock },
        GroupService,
        ConfigService,
        { provide: getRepositoryToken(Group), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
