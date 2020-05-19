/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
//#endregion
//#region Imports Local
import { PhonebookController } from './phonebook.controller';
//#endregion

describe('PhonebookController', () => {
  let controller: PhonebookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhonebookController],
      providers: [],
    }).compile();

    controller = module.get<PhonebookController>(PhonebookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
