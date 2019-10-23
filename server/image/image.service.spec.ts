/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { ImageService } from './image.service';
import { LoggerModule } from '../logger/logger.module';
import { LogService } from '../logger/logger.service';
import { LogServiceMock } from '../../__mocks__/logger.service.mock';
// #endregion

jest.mock('../logger/logger.service');

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [ImageService, { provide: LogService, useValue: LogServiceMock }],
    }).compile();

    service = module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
