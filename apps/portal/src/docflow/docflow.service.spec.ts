/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@app/config';
import { SoapService } from '@app/soap';
import { HttpModule } from '@nestjs/common';
import { DocFlowService } from './docflow.service';

jest.mock('@app/config/config.service');

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
      imports: [LoggerModule.forRoot(), HttpModule],
      providers: [
        ConfigService,
        DocFlowService,
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
