/** @format */

import { Test, TestingModule } from '@nestjs/testing';
import { TicketDepartmentService } from './department.service';

describe('DepartmentService', () => {
  let service: TicketDepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketDepartmentService],
    }).compile();

    service = module.get<TicketDepartmentService>(TicketDepartmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
