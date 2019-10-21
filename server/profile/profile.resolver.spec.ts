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
import { LogService } from '../logger/logger.service';
import { LogServiceMock } from '../../__mocks__/logger.service.mock';
import { GqlAuthGuard } from '../guards/gqlauth.guard';
import { GqlAuthGuardMock } from '../../__mocks__/gqlauth.guard.mock';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { JwtStrategyMock } from '../../__mocks__/jwt.strategy.mock';
import { UserEntity } from '../user/user.entity';
import { MockRepository } from '../../__mocks__/mockRepository.mock';
// #endregion

jest.mock('../logger/logger.service');
jest.mock('./profile.service');
jest.mock('../ldap/ldap.service');

describe('ProfileResolver', () => {
  let resolver: ProfileResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ProfileModule, TypeOrmModule.forRoot({}), TypeOrmModule.forFeature([ProfileEntity])],
      providers: [
        ProfileService,
        ProfileResolver,
        { provide: getRepositoryToken(UserEntity), useValue: MockRepository },
        { provide: getRepositoryToken(ProfileEntity), useValue: MockRepository },
      ],
    })
      .overrideProvider(LogService)
      .useValue(LogServiceMock)
      .overrideProvider(JwtStrategy)
      .useValue(JwtStrategyMock)
      .overrideGuard(GqlAuthGuard)
      .useValue(GqlAuthGuardMock)
      .compile();

    resolver = module.get<ProfileResolver>(ProfileResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
