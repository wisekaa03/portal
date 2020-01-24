/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule } from '@app/logger';
import { SoapModule, SoapOptions } from '@app/soap';
import { TicketOldService } from './old-service.service';

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
          useFactory: () => ({} as SoapOptions),
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
