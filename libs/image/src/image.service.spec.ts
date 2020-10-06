/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { ImageService } from './image.service';
//#endregion

const serviceMock = jest.fn(() => ({}));
jest.mock('@app/config/config.service');
jest.mock('sharp');

describe(ImageService.name, () => {
  let service: ImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ConfigService, ImageService, { provide: WINSTON_MODULE_PROVIDER, useValue: serviceMock }],
    }).compile();

    service = module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
