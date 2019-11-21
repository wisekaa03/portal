/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { SoapService } from './soap.service';

describe('SoapService', () => {
  let service: SoapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoapService],
    }).compile();

    service = module.get<SoapService>(SoapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
