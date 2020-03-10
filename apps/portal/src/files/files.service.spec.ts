/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
// import { ConfigService } from '@app/config';
import { FilesService } from './files.service';
import { UserService } from '../user/user.service';
import { ProfileService } from '../profile/profile.service';
// #endregion

const serviceMock = jest.fn(() => ({}));
const repositoryMock = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

@Entity()
class FilesEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

@Entity()
class FilesFolderEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () =>
            ({
              type: 'sqlite',
              database: ':memory:',
              dropSchema: true,
              entities: [FilesEntity, FilesFolderEntity],
              synchronize: true,
              logging: false,
            } as TypeOrmModuleOptions),
        }),
        TypeOrmModule.forFeature([FilesEntity, FilesFolderEntity]),
      ],
      providers: [
        FilesService,
        { provide: LogService, useValue: serviceMock },
        { provide: UserService, useValue: serviceMock },
        { provide: ProfileService, useValue: serviceMock },
        { provide: getRepositoryToken(FilesEntity), useValue: repositoryMock },
        { provide: getRepositoryToken(FilesFolderEntity), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
