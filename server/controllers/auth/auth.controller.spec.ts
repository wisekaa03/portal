/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
// #endregion
// #region Imports Local
import { AuthController } from './auth.controller';
import { ConfigService } from '../../config/config.service';
// #endregion

jest.mock('../../config/config.service');
jest.mock('../../logger/logger.service');

describe('Auth Controller', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'local', session: true })],
      controllers: [AuthController],
      providers: [ConfigService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
