/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { PhonebookController } from './phonebook.controller';
import { NextService } from '../../next/next.service';
import { LoggerService } from '../../logger/logger.service';
import { LoggerServiceMock } from '../../../__mocks__/logger.service.mock';
import { NextServiceMock } from '../../../__mocks__/next.service.mock';
// #endregion

describe('Phonebook Controller', () => {
  let controller: PhonebookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [PhonebookController],
      providers: [
        { provide: NextService, useClass: NextServiceMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
      ],
    }).compile();

    controller = module.get<PhonebookController>(PhonebookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
