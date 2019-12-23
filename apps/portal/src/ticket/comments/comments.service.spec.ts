/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { TicketCommentsService } from './comments.service';
// #endregion

describe('TicketCommentsService', () => {
  let service: TicketCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketCommentsService],
    }).compile();

    service = module.get<TicketCommentsService>(TicketCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
