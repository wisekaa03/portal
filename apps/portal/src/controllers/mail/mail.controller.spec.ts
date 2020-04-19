/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { MailController } from './mail.controller';
// #endregion

jest.mock('@app/logger/logger.service');

describe('MailController', () => {
  let controller: MailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      imports: [LoggerModule],
      providers: [],
    }).compile();

    controller = module.get<MailController>(MailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
