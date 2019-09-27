/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
// #endregion
// #region Imports Local
import { AuthController } from './auth.controller';
import { ConfigModule } from '../../config/config.module';
import { UserEntity } from '../../user/user.entity';
import { ConfigService } from '../../config/config.service';
import { UserService } from '../../user/user.service';
import { NextService } from '../../next/next.service';
import { LoggerService } from '../../logger/logger.service';
import { LoggerServiceMock } from '../../../__mocks__/logger.service.mock';
import { NextServiceMock } from '../../../__mocks__/next.service.mock';
import { ConfigServiceMock } from '../../../__mocks__/config.service.mock';
import { UserServiceMock } from '../../../__mocks__/user.service.mock';
// #endregion

describe('Auth Controller', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({}),
        TypeOrmModule.forFeature([UserEntity]),
        PassportModule.register({ defaultStrategy: 'jwt', session: true }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              ...configService.jwtModuleOptions,
            } as JwtModuleOptions;
          },
        }),
      ],
      controllers: [AuthController],
      providers: [
        { provide: ConfigService, useClass: ConfigServiceMock },
        { provide: NextService, useClass: NextServiceMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
        { provide: UserService, useClass: UserServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
