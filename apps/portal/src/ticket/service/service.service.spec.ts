/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { TicketServiceService } from './service.service';
// #endregion

describe('TicketServiceService', () => {
  let service: TicketServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketServiceService],
    }).compile();

    service = module.get<TicketServiceService>(TicketServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
