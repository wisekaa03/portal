/** @format */

import { Logger } from 'winston';
import { Logger as ITypeOrmLogger, QueryRunner } from 'typeorm';

export class TypeOrmLogger implements ITypeOrmLogger {
  constructor(private readonly logger: Logger) {}

  /**
   * Logs query and parameters used in it.
   */
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.logger.log(query, 'Database: log', parameters, queryRunner);
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.logger.error(query, error, 'Database: error', parameters, queryRunner);
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.logger.log(`Time is slow: ${time}`, 'Database: slow', parameters, queryRunner);
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
    this.logger.log(message, 'Database: schema', queryRunner);
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner): any {
    this.logger.log(message, 'Database: migration', queryRunner);
  }

  /**
   * Perform logging using given logger, or by default to the console.
   * Log has its own level and message.
   */
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): any {
    this.logger.log(message, 'Database: log', queryRunner);
  }
}
