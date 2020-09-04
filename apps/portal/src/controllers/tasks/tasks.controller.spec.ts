/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
//#endregion
//#region Imports Local
//#endregion

describe(TasksController.name, () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
