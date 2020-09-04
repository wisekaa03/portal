/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { DeprecatedController } from './deprecated.controller';
//#endregion
//#region Imports Local
//#endregion

describe(DeprecatedController.name, () => {
  let controller: DeprecatedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeprecatedController],
    }).compile();

    controller = module.get<DeprecatedController>(DeprecatedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
