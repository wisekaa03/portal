/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
//#endregion
//#region Imports Local
//#endregion

describe(SettingsController.name, () => {
  let controller: SettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
