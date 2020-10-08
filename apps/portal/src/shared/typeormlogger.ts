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
      this.logger.log('info', query, { context: 'Database', parameters, queryRunner });
    }
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    this.logger.error('error', query, {
      error,
      context: 'Database',
      parameters,
      queryRunner,
    });
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
    this.logger.log('info', `Time is slow: ${time}`, { context: 'Database', parameters, queryRunner });
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner): void {
    this.logger.log('info', message, {
      context: 'Database',
      queryRunner,
    });
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner): void {
    this.logger.log('info', message, {
      context: 'Database',
      queryRunner,
    });
  }

  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): void {
    this.logger.log(level, message, {
      context: 'Database',
      queryRunner,
    });
  }
}
