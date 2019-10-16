/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { MailController } from './mail.controller';
import { NextService } from '../../next/next.service';
import { LogService } from '../../logger/logger.service';
import { LogServiceMock } from '../../../__mocks__/logger.service.mock';
import { NextServiceMock } from '../../../__mocks__/next.service.mock';
import { NextModule } from '../../next/next.module';
import { LoggerModule } from '../../logger/logger.module';
// #endregion

describe('MailController', () => {
  let controller: MailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      imports: [NextModule, LoggerModule],
      providers: [],
    })
      .overrideProvider(NextService)
      .useValue(NextServiceMock)
      .overrideProvider(LogService)
      .useValue(LogServiceMock)
      .compile();

    controller = module.get<MailController>(MailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
