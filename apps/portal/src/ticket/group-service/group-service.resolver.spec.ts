/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { TicketGroupServiceResolver } from './group-service.resolver';
// #endregion

describe('TicketGroupServiceResolver', () => {
  let resolver: TicketGroupServiceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketGroupServiceResolver],
    }).compile();

    resolver = module.get<TicketGroupServiceResolver>(TicketGroupServiceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
