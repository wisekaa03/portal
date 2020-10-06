/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
//#endregion
//#region Imports Local
import { HomeController } from './home.controller';
//#endregion

describe(HomeController.name, () => {
  let controller: HomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      imports: [],
      providers: [],
    }).compile();

    controller = module.get<HomeController>(HomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
