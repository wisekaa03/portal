/** @format */

import { Logger } from 'winston';
import { Logger as ITypeOrmLogger, QueryRunner } from 'typeorm';

export class TypeOrmLogger implements ITypeOrmLogger {
  constructor(private readonly logger: Logger) {}

  /**
   * Logs query and parameters used in it.
   */
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    if (query !== 'SELECT 1') {
      this.logger.debug(query, 'Database', { parameters, queryRunner });
    }
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    this.logger.error(query, 'Database', {
      error,
      parameters,
      queryRunner,
    });
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    this.logger.debug(`Time is slow: ${time}`, { context: 'Database', parameters, queryRunner });
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner): void {
    this.logger.debug(message, 'Database', {
      queryRunner,
    });
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner): void {
    this.logger.debug(message, 'Database', {
      queryRunner,
    });
  }

  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): void {
    this.logger.debug(message, 'Database', {
      queryRunner,
    });
  }
}
