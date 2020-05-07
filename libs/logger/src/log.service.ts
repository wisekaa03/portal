/** @format */

// #region Imports NPM
import { Injectable, Scope, Inject } from '@nestjs/common';
import { Logger as TypeOrmLogger } from 'typeorm';
import { Logger, PinoLogger, Params } from 'nestjs-pino';
// #endregion

@Injectable({ scope: Scope.TRANSIENT })
export class LogService extends Logger implements TypeOrmLogger {
  constructor(private readonly pinoLogger: PinoLogger, @Inject('pino-params') { renameContext }: Params) {
    super(pinoLogger, { renameContext });
  }

  setContext(context: string): void {
    this.pinoLogger.setContext(context);
  }

  log(message: any, context?: string): void {
    let m = message;
    let c = context;
    if (m === 'info') {
      m = c;
      c = 'Database: Log';
    }
    super.log(m, c);
  }

  error(message: any, trace?: string | Record<any, any>, context?: string): void {
    let t: string | undefined;
    let m;

    if (message instanceof Error) {
      t = message.stack || '';
      m = message.message;
    } else if (typeof trace === 'object') {
      t = trace?.stack || trace.toString();
      m = message;
    } else {
      t = trace;
      m = message;
    }

    super.error(m, t, context);
  }

  // warn(message: any, context?: string): void {
  //   this.pinoLogger.warn(message, context);
  // }

  // debug(message: any, context?: string): void {
  //   this.pinoLogger.debug(message, context);
  // }

  // verbose(message: any, context?: string): void {
  //   this.pinoLogger.verbose(message, context);
  // }

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
