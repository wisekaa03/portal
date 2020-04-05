/** @format */

// #region Imports NPM
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { HealthCheckResult } from '@nestjs/terminus/dist/health-check';
// #endregion
// #region Imports Local
// #endregion

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService, private readonly db: TypeOrmHealthIndicator) {}

  @Get()
  @HealthCheck()
  public readiness(): Promise<HealthCheckResult> {
    return this.health.check([() => async () => this.db.pingCheck('database', { timeout: 400 })]);
  }
}
