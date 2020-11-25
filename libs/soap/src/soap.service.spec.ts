/** @format */

//#region Imports NPM
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { SoapService } from './soap.service';
//#endregion

const serviceMock = jest.fn(() => ({}));

jest.mock('@app/config/config.service');
jest.mock('soap', () => ({
  createClientAsync: () => undefined,
}));

describe(SoapService.name, () => {
  let service: SoapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ConfigService, SoapService, { provide: Logger, useValue: serviceMock }],
    }).compile();

    service = module.get<SoapService>(SoapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
