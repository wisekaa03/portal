/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { TicketAttachmentsService } from './attachments.service';
// #endregion

describe('TicketAttachmentsService', () => {
  let service: TicketAttachmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketAttachmentsService],
    }).compile();

    service = module.get<TicketAttachmentsService>(TicketAttachmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
