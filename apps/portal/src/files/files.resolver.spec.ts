/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

//#region Imports NPM
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config/config.service';
import { UserService } from '@back/user/user.service';
import { FilesResolver } from './files.resolver';
import { FilesService } from './files.service';
//#endregion

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));

describe(FilesResolver.name, () => {
  let resolver: FilesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ConfigService,
        FilesResolver,
        {
          provide: 'PUB_SUB',
          useValue: serviceMock,
        },
        { provide: Logger, useValue: serviceMock },
        { provide: FilesService, useValue: serviceMock },
        { provide: UserService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<FilesResolver>(FilesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
