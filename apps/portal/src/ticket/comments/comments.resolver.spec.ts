/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { TicketCommentsResolver } from './comments.resolver';
// #endregion

describe('TicketCommentsResolver', () => {
  let resolver: TicketCommentsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketCommentsResolver],
    }).compile();

    resolver = module.get<TicketCommentsResolver>(TicketCommentsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
