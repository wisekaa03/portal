/** @format */

import { HttpModule, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from 'nest-redis';

import { ConfigService } from '@app/config';
import { SoapService } from '@app/soap';
import { TicketsService } from './tickets.service';

jest.mock('@app/config/config.service');
jest.mock('nest-redis');

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

describe(TicketsService.name, () => {
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.registerAsync({
          useFactory: () => ({}),
        }),
      ],
      providers: [
        ConfigService,
        TicketsService,
        RedisService,
        {
          provide: 'PUB_SUB',
          useValue: serviceMock,
        },
        { provide: Logger, useValue: serviceMock },
        { provide: SoapService, useValue: serviceMock },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
