/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { PhonebookController } from './phonebook.controller';
// #endregion
// #region Imports Local
// #endregion

describe('Phonebook Controller', () => {
  let controller: PhonebookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhonebookController],
    }).compile();

    controller = module.get<PhonebookController>(PhonebookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
