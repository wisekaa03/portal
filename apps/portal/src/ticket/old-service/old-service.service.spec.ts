/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { SoapService } from '@app/soap';
import { OldTicketService } from './old-service.service';

jest.mock('@app/config/config.service');
jest.mock('@app/logger/log.service');

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
      imports: [],
      providers: [ConfigService, LogService, OldTicketService, { provide: SoapService, useValue: serviceMock }],
    }).compile();

    service = module.get<OldTicketService>(OldTicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
