/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ConfigService } from '@app/config';
import { SoapService } from '@app/soap';
import { ReportsService } from './reports.service';

jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

describe(ReportsService.name, () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ConfigService,
        ReportsService,
        { provide: WINSTON_MODULE_PROVIDER, useValue: serviceMock },
        { provide: SoapService, useValue: serviceMock },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
