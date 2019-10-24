/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { PhonebookController } from './phonebook.controller';
import { NextService } from '../../next/next.service';
import { NextServiceMock } from '../../../__mocks__/next.service.mock';
// #endregion

describe('PhonebookController', () => {
  let controller: PhonebookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhonebookController],
      providers: [{ provide: NextService, useClass: NextServiceMock }],
    }).compile();

    controller = module.get<PhonebookController>(PhonebookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
