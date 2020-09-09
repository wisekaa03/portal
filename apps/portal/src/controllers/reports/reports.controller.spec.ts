/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
//#endregion
//#region Imports Local
//#endregion

describe(ReportsController.name, () => {
  let controller: ReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
