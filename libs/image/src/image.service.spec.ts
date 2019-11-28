/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { ImageService } from './image.service';
// #endregion

jest.mock('@app/logger/logger.service', () => ({
  LogService: jest.fn().mockImplementation(() => ({
    debug: jest.fn(),
  })),
}));
jest.mock('sharp');

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [ImageService],
    }).compile();

    service = module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
