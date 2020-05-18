/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@app/config';
import { TicketsResolver } from './tickets.resolver';
import { TicketsService } from './tickets.service';

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

describe('TicketOldServiceResolver', () => {
  let resolver: TicketsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        { provide: TicketsService, useValue: serviceMock },
        { provide: ConfigService, useValue: serviceMock },
        TicketsResolver,
      ],
    }).compile();

    resolver = module.get<TicketsResolver>(TicketsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
