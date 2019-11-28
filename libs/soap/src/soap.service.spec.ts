/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule } from '@app/logger';
import { SoapModule } from './soap.module';
import { SoapService } from './soap.service';
// import { SoapOptions } from './soap.interface';
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
        ConfigModule.register(resolve('.env')),
        LoggerModule,

        SoapModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              url: configService.get<string>('SOAP_URL'),
              options: {
                wsdl_headers: {
                  connection: 'keep-alive',
                },
                wsdl_options: {
                  ntlm: true,
                  username: configService.get<string>('SOAP_USER'),
                  password: configService.get<string>('SOAP_PASS'),
                },
              },
            };
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
