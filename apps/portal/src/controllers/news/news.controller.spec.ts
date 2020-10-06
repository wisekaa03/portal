/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
//#endregion
//#region Imports Local
import { NewsController } from './news.controller';
//#endregion

describe(NewsController.name, () => {
  let controller: NewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      imports: [],
      providers: [],
    }).compile();

    controller = module.get<NewsController>(NewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
