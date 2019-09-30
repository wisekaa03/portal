/** @format */

// #region Imports NPM
import { Logger /* , LoggerService, LoggerService */ } from '@nestjs/common';
// #endregion

const dev = process.env.NODE_ENV !== 'production';

export class LogService extends Logger /* implements LoggerService  */ {
  // logger: Logger;

  locale = undefined;

  format = {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  // constructor(context?: string, isTimestampEnabled?: boolean) {
  //   super(context, isTimestampEnabled);
  //   if (dev) {
  //     this.logger = new Logger(context, isTimestampEnabled);
  //   }
  // }

  log(message: any, context?: string): void {
    if (dev) {
      // this.logger.log(message, context);
      super.log(message, context);
    } else {
      console.log(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message);
    }
  }

  error(message: any, trace?: string, context?: string): void {
    if (dev) {
      // this.logger.error(message, trace, context);
      super.error(message, trace, context);
    } else {
      console.error(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message, trace);
    }
  }

  warn(message: any, context?: string): void {
    if (dev) {
      // this.logger.warn(message, context);
      super.warn(message, context);
    } else {
      console.warn(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message);
    }
  }

  debug(message: any, context?: string): void {
    if (dev) {
      // this.logger.debug(message, context);
      super.debug(message, context);
    } else {
      console.debug(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message);
    }
  }

  verbose(message: any, context?: string): void {
    if (dev) {
      // this.logger.verbose(message, context);
      super.verbose(message, context);
    } else {
      console.info(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message);
    }
  }

  /**
   * From app.use(morgan('dev', { stream: logger })) - the request/response logging
   *
   * @param message Message string
   */
  write(message: string): void {
    this.verbose(message.replace(/\n/, ''), 'Request');
  }
}
