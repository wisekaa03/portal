/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
//#endregion
//#region Imports Local
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
//#endregion

const serviceMock = jest.fn(() => ({}));

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ProfileResolver, { provide: ProfileService, useValue: serviceMock }],
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
