/** @format */

//#region Imports NPM
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
//#endregion
//#region Imports Local
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { IsAdminGuard } from '../guards/gqlauth-admin.guard';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
//#endregion

const serviceMock = jest.fn(() => ({}));

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [{ provide: Logger, useValue: serviceMock }, ProfileResolver, { provide: ProfileService, useValue: serviceMock }],
    })
      .overrideGuard(GqlAuthGuard)
      .useValue(serviceMock)
      .overrideGuard(IsAdminGuard)
      .useValue(serviceMock)
      .compile();

    resolver = module.get<ProfileResolver>(ProfileResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
