/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { SoapService } from './soap.service';
import { SOAP_OPTIONS } from './soap.interface';
// #endregion

// const serviceMock = jest.fn(() => ({}));

jest.mock('@app/config/config.service');
jest.mock('soap', () => ({
  createClientAsync: () => undefined,
}));

describe(SoapService.name, () => {
  let service: SoapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot()],
      providers: [{ provide: SOAP_OPTIONS, useValue: {} }, ConfigService, SoapService],
    }).compile();

    service = module.get<SoapService>(SoapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
