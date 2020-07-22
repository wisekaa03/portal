/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { FaqController } from './faq.controller';
//#endregion
//#region Imports Local
//#endregion

describe(FaqController.name, () => {
  let controller: FaqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaqController],
    }).compile();

    controller = module.get<FaqController>(FaqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
