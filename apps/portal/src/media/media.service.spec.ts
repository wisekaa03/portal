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
import { MediaService } from './media.service';
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
class MediaEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

@Entity()
class MediaDirectoryEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: async () =>
            ({
              type: 'sqlite',
              database: ':memory:',
              dropSchema: true,
              entities: [MediaEntity, MediaDirectoryEntity],
              synchronize: true,
              logging: false,
            } as TypeOrmModuleOptions),
        }),
        TypeOrmModule.forFeature([MediaEntity, MediaDirectoryEntity]),
      ],
      providers: [
        MediaService,
        { provide: LogService, useValue: serviceMock },
        { provide: UserService, useValue: serviceMock },
        { provide: ProfileService, useValue: serviceMock },
        { provide: getRepositoryToken(MediaEntity), useValue: repositoryMock },
        { provide: getRepositoryToken(MediaDirectoryEntity), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
