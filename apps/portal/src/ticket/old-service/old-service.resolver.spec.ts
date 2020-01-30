/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@app/config';
import { OldTicketResolver } from './old-service.resolver';
import { OldTicketService } from './old-service.service';

jest.mock('./old-service.service');

describe('TicketOldServiceResolver', () => {
  let resolver: OldTicketResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.register('.env.example')],
      providers: [OldTicketService, OldTicketResolver],
    }).compile();

    resolver = module.get<OldTicketResolver>(OldTicketResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
