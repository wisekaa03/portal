/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { TicketOldServiceService } from './old-service.service';

describe('OldServiceService', () => {
  let service: TicketOldServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketOldServiceService],
    }).compile();

    service = module.get<TicketOldServiceService>(TicketOldServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
