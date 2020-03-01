/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@app/config';
import { OldTicketResolver } from './old-service.resolver';
import { OldTicketService } from './old-service.service';

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

describe('TicketOldServiceResolver', () => {
  let resolver: OldTicketResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        { provide: OldTicketService, useValue: serviceMock },
        { provide: ConfigService, useValue: serviceMock },
        OldTicketResolver,
      ],
    }).compile();

    resolver = module.get<OldTicketResolver>(OldTicketResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
