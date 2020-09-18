/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@app/config';
import { DocFlowResolver } from './docflow.resolver';
import { DocFlowService } from './docflow.service';

const serviceMock = jest.fn(() => ({}));
// const repositoryMock = jest.fn(() => ({
//   metadata: {
//     columns: [],
//     relations: [],
//   },
// }));

describe(DocFlowResolver.name, () => {
  let resolver: DocFlowResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        { provide: DocFlowService, useValue: serviceMock },
        { provide: ConfigService, useValue: serviceMock },
        {
          provide: 'PUB_SUB',
          useValue: serviceMock,
        },
        DocFlowResolver,
      ],
    }).compile();

    resolver = module.get<DocFlowResolver>(DocFlowResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
