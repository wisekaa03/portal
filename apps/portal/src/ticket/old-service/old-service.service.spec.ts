/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule } from '@app/logger';
import { SoapModule } from '@app/soap';
import { TicketOldService } from './old-service.service';

jest.mock('@app/config/config.service');
jest.mock('@app/soap/soap.service');

describe('OldServiceService', () => {
  let service: TicketOldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // #region Config & Log module
        ConfigModule,
        LoggerModule,
        // #endregion

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
      providers: [TicketOldService],
    }).compile();

    service = module.get<TicketOldService>(TicketOldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
