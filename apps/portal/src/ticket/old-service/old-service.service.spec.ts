/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@app/config';
import { SoapService } from '@app/soap';
import { HttpModule } from '@nestjs/common';
import { OldTicketService } from './old-service.service';

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

describe(OldTicketService.name, () => {
  let service: OldTicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [LoggerModule.forRoot(), HttpModule],
      providers: [ConfigService, OldTicketService, { provide: SoapService, useValue: serviceMock }],
    }).compile();

    service = module.get<OldTicketService>(OldTicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
