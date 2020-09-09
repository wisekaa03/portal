/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { DocFlowController } from './docflow.controller';
//#endregion
//#region Imports Local
//#endregion

describe(DocFlowController.name, () => {
  let controller: DocFlowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocFlowController],
    }).compile();

    controller = module.get<DocFlowController>(DocFlowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
