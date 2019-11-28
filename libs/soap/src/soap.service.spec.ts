/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule } from '@app/logger';
import { SoapModule } from './soap.module';
import { SoapService } from './soap.service';
import { SoapOptions } from './soap.interface';
// #endregion

jest.mock('soap', () => ({
  createClientAsync: () => undefined,
}));

jest.mock('@app/logger/logger.service', () => ({
  LogService: jest.fn().mockImplementation(() => ({
    debug: jest.fn(),
  })),
}));
jest.mock('@app/config/config.service');

describe('SoapService', () => {
  let service: SoapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.register('.env'),
        LoggerModule,

        SoapModule.registerAsync({
          useFactory: () => {
            return {} as SoapOptions;
          },
        }),
      ],
      providers: [],
    }).compile();

    service = module.get<SoapService>(SoapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
