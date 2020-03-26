/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
// #endregion
// #region Imports Local
import { LdapService } from '@app/ldap';
import { ImageService } from '@app/image';
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config';
import { GroupService } from '@back/group/group.service';
import { ProfileService } from './profile.service';
// #endregion

const serviceMock = jest.fn(() => ({}));
jest.mock('@app/config/config.service', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
  })),
}));
const repositoryMock = jest.fn(() => ({
  metadata: {
    columns: [],
    relations: [],
  },
}));

@Entity()
class ProfileEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;
}

// jest.mock('../guards/gqlauth.guard');

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
              entities: [ProfileEntity],
              synchronize: true,
              logging: false,
            } as TypeOrmModuleOptions),
        }),
        TypeOrmModule.forFeature([ProfileEntity]),
      ],
      providers: [
        ProfileService,
        ConfigService,
        { provide: LogService, useValue: serviceMock },
        { provide: LdapService, useValue: serviceMock },
        { provide: GroupService, useValue: serviceMock },
        { provide: ImageService, useValue: serviceMock },
        // { provide: getRepositoryToken(GroupEntity), useValue: repositoryMock },
        // { provide: getRepositoryToken(UserEntity), useValue: repositoryMock },
        { provide: getRepositoryToken(ProfileEntity), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
