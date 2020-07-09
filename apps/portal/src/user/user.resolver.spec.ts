/** @format */

//#region Imports NPM
// import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
//#endregion
//#region Imports Local
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
//#endregion

const serviceMock = jest.fn(() => ({}));

describe('UsersResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [UserResolver, { provide: UserService, useValue: serviceMock }],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
