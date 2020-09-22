/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import { ConfigService } from '@app/config';
import { SoapService } from '@app/soap';
import { HttpModule } from '@nestjs/common';
import { TIMEOUT } from '@back/shared/constants';
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
      imports: [
        LoggerModule.forRoot(),
        HttpModule.registerAsync({
          useFactory: () => ({
            timeout: TIMEOUT,
          }),
        }),
      ],
      providers: [ConfigService, ReportsService, { provide: SoapService, useValue: serviceMock }],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
