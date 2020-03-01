/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@app/config';
import { LogService } from '@app/logger';
import { SoapService } from '@app/soap';
import { OldTicketService } from './old-service.service';

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

describe('OldServiceService', () => {
  let service: OldTicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        OldTicketService,
        { provide: LogService, useValue: serviceMock },
        { provide: ConfigService, useValue: serviceMock },
        { provide: SoapService, useValue: serviceMock },
      ],
    }).compile();

    service = module.get<OldTicketService>(OldTicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
