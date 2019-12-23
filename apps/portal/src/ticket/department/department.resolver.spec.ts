/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { TicketDepartmentResolver } from './department.resolver';
// #endregion

describe('TicketDepartmentResolver', () => {
  let resolver: TicketDepartmentResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketDepartmentResolver],
    }).compile();

    resolver = module.get<TicketDepartmentResolver>(TicketDepartmentResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
