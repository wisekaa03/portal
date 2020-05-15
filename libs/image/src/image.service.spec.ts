/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { ImageService } from './image.service';
// #endregion

jest.mock('@app/config/config.service');

// const serviceMock = jest.fn(() => ({}));
jest.mock('sharp');

describe(ImageService.name, () => {
  let service: ImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [ConfigService, ImageService],
    }).compile();

    service = module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
