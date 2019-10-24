/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
// #endregion
// #region Imports Local
import { AuthController } from './auth.controller';
import { ConfigService } from '../../config/config.service';
import { NextService } from '../../next/next.service';
import { NextServiceMock } from '../../../__mocks__/next.service.mock';
import { ConfigServiceMock } from '../../../__mocks__/config.service.mock';
// #endregion

jest.mock('../../logger/logger.service');

describe('Auth Controller', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt', session: true }),
        JwtModule.registerAsync({
          useFactory: async () => {
            return {} as JwtModuleOptions;
          },
        }),
      ],
      controllers: [AuthController],
      providers: [
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: NextService, useClass: NextServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
