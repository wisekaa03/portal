/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
//#endregion
//#region Imports Local
import { NewsResolver } from './news.resolver';
import { NewsService } from './news.service';
//#endregion

const serviceMock = jest.fn(() => ({}));

describe(NewsResolver.name, () => {
  let resolver: NewsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [NewsResolver, { provide: NewsService, useValue: serviceMock }],
    }).compile();

    resolver = module.get<NewsResolver>(NewsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
