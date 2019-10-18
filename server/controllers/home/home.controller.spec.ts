/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { NextService } from '../../next/next.service';
import { HomeController } from './home.controller';
import { LogService } from '../../logger/logger.service';
import { LogServiceMock } from '../../../__mocks__/logger.service.mock';
import { NextServiceMock } from '../../../__mocks__/next.service.mock';
import { NextModule } from '../../next/next.module';
import { LoggerModule } from '../../logger/logger.module';
// #endregion

jest.mock('../../logger/logger.service');

describe('HomeController', () => {
  let controller: HomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      imports: [NextModule, LoggerModule],
      providers: [],
    })
      .overrideProvider(NextService)
      .useValue(NextServiceMock)
      .overrideProvider(LogService)
      .useValue(LogServiceMock)
      .compile();

    controller = module.get<HomeController>(HomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
