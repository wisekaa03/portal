/** @format */

import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from 'nest-redis';

import { ConfigService } from '../../../../libs/config/src';
import { SoapService } from '../../../../libs/soap/src';
import { DocFlowService } from './docflow.service';

jest.mock('@app/config/config.service');
jest.mock('nest-redis');

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

describe(DocFlowService.name, () => {
  let service: DocFlowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ConfigService,
        DocFlowService,
        RedisService,
        { provide: Logger, useValue: serviceMock },
        { provide: 'PUB_SUB', useValue: serviceMock },
        { provide: SoapService, useValue: serviceMock },
      ],
    }).compile();

    service = module.get<DocFlowService>(DocFlowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
