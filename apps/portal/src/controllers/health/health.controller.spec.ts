/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { HealthController } from './health.controller';
//#endregion

jest.mock('@app/config/config.service');
const serviceMock = jest.fn(() => ({}));

describe('Health Controller', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: [ConfigService, { provide: HealthCheckService, useValue: serviceMock }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
