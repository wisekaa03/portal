/** @format */

//#region Imports NPM
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { HealthCheckResult } from '@nestjs/terminus/dist/health-check';
import { Transport } from '@nestjs/microservices';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
//#endregion

@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly health: HealthCheckService,
    private readonly database: TypeOrmHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  public readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.database.pingCheck('database', { timeout: 400 }),
      // @todo: some problem
      // () =>
      //   this.microservice.pingCheck('microservice', {
      //     transport: Transport.REDIS,
      //     options: { url: this.configService.get<string>('MICROSERVICE_URL') },
      //   }),
    ]);
  }
}
