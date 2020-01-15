/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
// import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
// #endregion
// #region Imports Local
import { ImageModule } from '@app/image';
import { ConfigModule } from '@app/config';
import { NewsResolver } from './news.resolver';
import { NewsService } from './news.service';
// import { NewsModule } from './news.module';
// import { NewsEntity } from './news.entity';
// #endregion

jest.mock('@nestjs/typeorm/dist/typeorm.module');
jest.mock('../guards/gqlauth.guard');
jest.mock('./news.service');

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV === 'test';
const env = resolve(__dirname, dev ? (test ? '../../../..' : '../../..') : '../../..', '.env');

describe('NewsResolver', () => {
  let resolver: NewsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.register(env),
        ImageModule,
        // TypeOrmModule.forRoot({}),
        // TypeOrmModule.forFeature([NewsEntity]),
      ],
      providers: [
        NewsService,
        NewsResolver,
        // { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        // { provide: getRepositoryToken(NewsEntity), useValue: mockRepository },
      ],
    })
      // .overrideGuard(GqlAuthGuard)
      // .useValue(GqlAuthGuardMock)
      .compile();

    resolver = module.get<NewsResolver>(NewsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
