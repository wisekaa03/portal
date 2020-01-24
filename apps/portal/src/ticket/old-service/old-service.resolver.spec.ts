/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@app/config';
import { TicketOldServiceResolver } from './old-service.resolver';
import { TicketOldService } from './old-service.service';

jest.mock('./old-service.service');

describe('TicketOldServiceResolver', () => {
  let resolver: TicketOldServiceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.register('.env.example')],
      providers: [TicketOldService, TicketOldServiceResolver],
    }).compile();

    resolver = module.get<TicketOldServiceResolver>(TicketOldServiceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
