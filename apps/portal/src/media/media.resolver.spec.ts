/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
// import { ConfigService } from '@app/config';
import { MediaResolver } from './media.resolver';
import { MediaService } from './media.service';
import { UserService } from '../user/user.service';
// #endregion

const serviceMock = jest.fn(() => ({}));

describe('MediaResolver', () => {
  let resolver: MediaResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        MediaResolver,
        { provide: MediaService, useValue: serviceMock },
        { provide: LogService, useValue: serviceMock },
        { provide: UserService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<MediaResolver>(MediaResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
