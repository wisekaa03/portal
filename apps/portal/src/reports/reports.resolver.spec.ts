/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@app/config';
import { ReportsResolver } from './reports.resolver';
import { ReportsService } from './reports.service';

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

describe(ReportsResolver.name, () => {
  let resolver: ReportsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [{ provide: ReportsService, useValue: serviceMock }, { provide: ConfigService, useValue: serviceMock }, ReportsResolver],
    }).compile();

    resolver = module.get<ReportsResolver>(ReportsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
