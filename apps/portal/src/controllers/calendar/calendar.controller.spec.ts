/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { CalendarController } from './calendar.controller';
//#endregion
//#region Imports Local
//#endregion

describe('Calendar Controller', () => {
  let controller: CalendarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarController],
    }).compile();

    controller = module.get<CalendarController>(CalendarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
