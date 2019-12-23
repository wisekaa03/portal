/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { TicketAttachmentsResolver } from './attachments.resolver';
// #endregion

describe('TicketAttachmentsResolver', () => {
  let resolver: TicketAttachmentsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketAttachmentsResolver],
    }).compile();

    resolver = module.get<TicketAttachmentsResolver>(TicketAttachmentsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
