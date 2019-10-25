/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { ItapplicationController } from './itapplication.controller';
// #endregion
// #region Imports Local
// #endregion

describe('Itapplication Controller', () => {
  let controller: ItapplicationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItapplicationController],
    }).compile();

    controller = module.get<ItapplicationController>(ItapplicationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
