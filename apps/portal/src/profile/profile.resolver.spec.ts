/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { ImageModule } from '@app/image';
import { ConfigModule, ConfigService } from '@app/config';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { ProfileModule } from './profile.module';
import { ProfileEntity } from './profile.entity';
// #endregion

jest.mock('../guards/gqlauth.guard');
jest.mock('./profile.service');

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ImageModule, ProfileModule, TypeOrmModule.forRoot({}), TypeOrmModule.forFeature([ProfileEntity])],
      providers: [
        {
          provide: ConfigService,
          useValue: new ConfigService(resolve(__dirname, '../../../..', '.env')),
        },
        ProfileService,
        ProfileResolver,
        // { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        // { provide: getRepositoryToken(ProfileEntity), useValue: MockRepository },
      ],
    })
      // .overrideGuard(GqlAuthGuard)
      // .useValue(GqlAuthGuardMock)
      .compile();

    resolver = module.get<ProfileResolver>(ProfileResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
