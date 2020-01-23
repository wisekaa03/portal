/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { TicketOldServiceResolver } from './old-service.resolver';

describe('OldServiceResolver', () => {
  let resolver: TicketOldServiceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketOldServiceResolver],
    }).compile();

    resolver = module.get<TicketOldServiceResolver>(TicketOldServiceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
