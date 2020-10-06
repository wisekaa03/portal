/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { GroupService } from './group.service';
import { GroupEntity } from './group.entity';
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
        TypeOrmModule.forRootAsync({
          useFactory: async () =>
            ({
              type: 'sqlite',
              database: ':memory:',
              dropSchema: true,
              entities: [GroupEntity],
              synchronize: true,
              logging: false,
            } as TypeOrmModuleOptions),
        }),
        // TypeOrmModule.forFeature([GroupEntity]),
      ],
      providers: [
        { provide: WINSTON_MODULE_PROVIDER, useValue: serviceMock },
        { provide: getRepositoryToken(GroupEntity), useValue: repositoryMock },
        GroupService,
        ConfigService,
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
