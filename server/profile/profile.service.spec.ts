/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { ProfileService } from './profile.service';
// #endregion

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileService],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
