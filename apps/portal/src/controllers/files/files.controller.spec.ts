/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
//#endregion
//#region Imports Local
import { FilesController } from './files.controller';
//#endregion

describe('Files Controller', () => {
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
