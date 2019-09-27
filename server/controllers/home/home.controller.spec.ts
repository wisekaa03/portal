/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { NextModule } from '../../next/next.module';
import { HomeController } from './home.controller';
import { LoggerModule } from '../../logger/logger.module';
// #endregion

describe('Home Controller', () => {
  let controller: HomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NextModule, LoggerModule],
      controllers: [HomeController],
    }).compile();

    controller = module.get<HomeController>(HomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
