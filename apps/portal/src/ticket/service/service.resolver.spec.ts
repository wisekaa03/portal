/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { TicketServiceResolver } from './service.resolver';
// #endregion

describe('TicketServiceResolver', () => {
  let resolver: TicketServiceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketServiceResolver],
    }).compile();

    resolver = module.get<TicketServiceResolver>(TicketServiceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
