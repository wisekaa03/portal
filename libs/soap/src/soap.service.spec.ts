/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { SoapService } from './soap.service';
import { SOAP_OPTIONS } from './soap.interface';
// #endregion

// const serviceMock = jest.fn(() => ({}));

jest.mock('@app/config/config.service');
jest.mock('@app/logger/log.service');
jest.mock('soap', () => ({
  createClientAsync: () => undefined,
}));

describe(SoapService.name, () => {
  let service: SoapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [{ provide: SOAP_OPTIONS, useValue: {} }, ConfigService, LogService, SoapService],
    }).compile();

    service = module.get<SoapService>(SoapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
