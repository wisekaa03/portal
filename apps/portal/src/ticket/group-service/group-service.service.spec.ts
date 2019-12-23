/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { TicketGroupServiceService } from './group-service.service';
// #endregion

describe('TicketGroupServiceService', () => {
  let service: TicketGroupServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketGroupServiceService],
    }).compile();

    service = module.get<TicketGroupServiceService>(TicketGroupServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
