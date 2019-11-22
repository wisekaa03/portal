/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
// import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { ImageModule } from '@app/image';
import { ConfigModule, ConfigService } from '@app/config';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import { ProfileModule } from './profile.module';
// import { ProfileEntity } from './profile.entity';
// #endregion

jest.mock('@nestjs/typeorm/dist/typeorm.module');
jest.mock('../guards/gqlauth.guard');
jest.mock('./profile.service');

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV === 'test';
const env = resolve(__dirname, dev ? (test ? '../../../..' : '../../..') : '../../..', '.env');

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.register(env),
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
