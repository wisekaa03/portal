/** @format */

import { LoggerService } from '@nestjs/common';
import { Logger as ITypeOrmLogger, QueryRunner } from 'typeorm';

export class TypeOrmLogger implements ITypeOrmLogger {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Logs query and parameters used in it.
   */
  logQuery(query: string, parameters?: unknown[], queryRunner?: QueryRunner): void {
    if (query !== 'SELECT 1' && this.logger.debug) {
      this.logger.debug({ message: query, parameters }, 'Database');
    }
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(error: string, query: string, parameters?: unknown[], queryRunner?: QueryRunner): void {
    this.logger.error(
      {
        message: query,
        error,
        parameters,
      },
      'Database',
    );
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(time: number, query: string, parameters?: unknown[], queryRunner?: QueryRunner): void {
    if (this.logger.debug) {
      this.logger.debug({ message: `Time is slow: ${time}`, parameters }, 'Database');
    }
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner): void {
    if (this.logger.debug) {
      this.logger.debug(
        {
          message,
        },
        'Database',
      );
    }
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner): void {
    if (this.logger.debug) {
      this.logger.debug(
        {
          message,
        },
        'Database',
      );
    }
  }

  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(level: 'log' | 'info' | 'warn', message: unknown, queryRunner?: QueryRunner): void {
    if (this.logger.debug) {
      this.logger.debug(message, 'Database');
    }
  }
}
