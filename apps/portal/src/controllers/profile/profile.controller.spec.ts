/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
//#endregion
//#region Imports Local
//#endregion

describe(ProfileController.name, () => {
  let controller: ProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
