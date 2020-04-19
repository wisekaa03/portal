/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { Logger } from '@app/logger';
// import { ConfigService } from '@app/config';
import { UserService } from '@back/user/user.service';
import { FilesResolver } from './files.resolver';
import { FilesService } from './files.service';
// #endregion

const serviceMock = jest.fn(() => ({}));

describe('FilesResolver', () => {
  let resolver: FilesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        FilesResolver,
        { provide: FilesService, useValue: serviceMock },
        { provide: Logger, useValue: serviceMock },
        { provide: UserService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<FilesResolver>(FilesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
