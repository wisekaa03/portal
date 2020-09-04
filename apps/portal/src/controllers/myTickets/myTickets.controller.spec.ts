/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { MyTicketsController } from './myTickets.controller';
//#endregion
//#region Imports Local
//#endregion

describe(MyTicketsController.name, () => {
  let controller: MyTicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyTicketsController],
    }).compile();

    controller = module.get<MyTicketsController>(MyTicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
