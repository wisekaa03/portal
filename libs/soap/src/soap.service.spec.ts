/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigModule } from '@app/config';
import { Logger } from '@app/logger';
import { SoapModule } from './soap.module';
import { SoapService } from './soap.service';
import { SoapOptions } from './soap.interface';
// #endregion

const serviceMock = jest.fn(() => ({}));

jest.mock('soap', () => ({
  createClientAsync: () => undefined,
}));

jest.mock('@app/config/config.service');

describe('SoapService', () => {
  let service: SoapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.register('.env'),
        LoggerModule.forRoot(),

        SoapModule.registerAsync({
          useFactory: () => {
            return {} as SoapOptions;
          },
        }),
      ],
      providers: [{ provide: Logger, useValue: serviceMock }],
    }).compile();

    service = module.get<SoapService>(SoapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
