/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { ProfileModule } from './profile.module';
import { ProfileEntity } from './profile.entity';
// import { GqlAuthGuard } from '../guards/gqlauth.guard';
// import { GqlAuthGuardMock } from '../../__mocks__/gqlauth.guard.mock';
import { UserEntity } from '../user/user.entity';
// import { MockRepository } from '../../__mocks__/mockRepository.mock';
import { ImageModule } from '../image/image.module';
// #endregion

jest.mock('../guards/gqlauth.guard');
jest.mock('./profile.service');

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ImageModule, ProfileModule, TypeOrmModule.forRoot({}), TypeOrmModule.forFeature([ProfileEntity])],
      providers: [
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
