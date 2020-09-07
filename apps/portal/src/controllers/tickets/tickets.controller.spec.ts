/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
//#endregion
//#region Imports Local
//#endregion

describe('TicketsController', () => {
  let controller: TicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
