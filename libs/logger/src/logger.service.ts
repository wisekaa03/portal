/** @format */

// #region Imports NPM
import { Logger as TypeOrmLogger } from 'typeorm';
import { Logger as PinoLogger } from 'nestjs-pino';
// #endregion

export class Logger extends PinoLogger implements TypeOrmLogger {
  locale = undefined;

  log(message: any, context?: string): void {
    let m = message;
    let c = context;
    if (m === 'info') {
      m = c;
      c = 'Database: Log';
    }
    super.log(m, c);
  }

  error(message: any, trace?: object | string, context?: string): void {
    if (typeof trace === 'object') {
      super.error(message, JSON.stringify(trace), context);
    } else {
      super.error(message, trace, context);
    }
  }

  warn(message: any, context?: string): void {
    super.warn(message, context);
  }

  debug(message: any, context?: string): void {
    super.debug(message, context);
  }

  verbose(message: any, context?: string): void {
    super.verbose(message, context);
  }

  /**
   * From app.use(morgan('dev', { stream: logger })) - the request/response logging
   *
   * @param {string} message Message string
   */
  write(message: string): void {
    this.verbose(message.replace(/\n/, ''), 'Request');
  }

  /**
   * From TypeORM: logQuery
   */
  logQuery(message: any): void {
    this.verbose(message, 'Database: Query');
  }

  /**
   * From TypeORM: logQueryError
   */
  logQueryError(message: any, query: any, parameters: any): void {
    this.error(`${message} ${parameters}`, query);
  }

  /**
   * From TypeORM: Schema build
   */
  logSchemaBuild(message: any): void {
    this.verbose(message, 'Database: Schema build');
  }

  logMigration(message: any): void {
    this.verbose(message, 'Database: Migration');
  }

  logQuerySlow(message: any): void {
    this.verbose(message, 'Database: Slow query');
  }
}
