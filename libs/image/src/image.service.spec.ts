/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { ImageService } from './image.service';
// #endregion

jest.mock('@app/config/config.service');
jest.mock('@app/logger/log.service');

// const serviceMock = jest.fn(() => ({}));
jest.mock('sharp');

describe(ImageService.name, () => {
  let service: ImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ConfigService, LogService, ImageService],
    }).compile();

    service = module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
