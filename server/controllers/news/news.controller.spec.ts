/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { NewsController } from './news.controller';
import { NextService } from '../../next/next.service';
import { LogService } from '../../logger/logger.service';
import { LogServiceMock } from '../../../__mocks__/logger.service.mock';
import { NextServiceMock } from '../../../__mocks__/next.service.mock';
import { NextModule } from '../../next/next.module';
import { LoggerModule } from '../../logger/logger.module';
// #endregion

jest.mock('../../logger/logger.service');

describe('NewsController', () => {
  let controller: NewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      imports: [NextModule, LoggerModule],
      providers: [],
    })
      .overrideProvider(NextService)
      .useValue(NextServiceMock)
      .overrideProvider(LogService)
      .useValue(LogServiceMock)
      .compile();

    controller = module.get<NewsController>(NewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
