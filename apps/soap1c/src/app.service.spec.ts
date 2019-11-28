/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { SoapModule, SoapOptions } from '@app/soap';
import { AppService } from './app.service';
// #endregion

jest.mock('@app/soap/soap.service');

describe('AppService', () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        SoapModule.registerAsync({
          useFactory: () => ({} as SoapOptions),
        }),
      ],
      controllers: [],
      providers: [AppService],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('"synchronization" should be defined', () => {
      expect(appService.synchronization()).toBeDefined();
    });
  });
});
