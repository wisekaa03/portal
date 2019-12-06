/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { ImageModule } from '@app/image';
import { ConfigModule } from '@app/config';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
// import { ProfileEntity } from './profile.entity';
// #endregion

jest.mock('typeorm-graphql-pagination');
jest.mock('@nestjs/typeorm/dist/typeorm.module');
jest.mock('../guards/gqlauth.guard');
jest.mock('./profile.service');

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.register('.env'),
        ImageModule,
        // TypeOrmModule.forRoot({}),
        // TypeOrmModule.forFeature([ProfileEntity]),
      ],
      providers: [
        ProfileService,
        ProfileResolver,
        // { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        // { provide: getRepositoryToken(ProfileEntity), useValue: mockRepository },
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
