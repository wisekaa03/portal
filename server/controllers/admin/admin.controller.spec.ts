/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
// #endregion
// #region Imports Local
// #endregion

describe('Admin Controller', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
