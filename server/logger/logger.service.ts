/** @format */

// #region Imports NPM
import { Logger } from '@nestjs/common';
// #endregion

const dev = process.env.NODE_ENV !== 'production';

export class LoggerService extends Logger {
  locale = 'en-US';

  format = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false,
    hourCycle: 'h24',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  log(message: any, context?: string): void {
    if (dev) {
      super.log(message, context);
    } else {
      console.log(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message);
    }
  }

  error(message: any, trace?: string, context?: string): void {
    if (dev) {
      super.error(message, trace, context);
    } else {
      console.error(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message, trace);
    }
  }

  warn(message: any, context?: string): void {
    if (dev) {
      super.warn(message, context);
    } else {
      console.warn(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message);
    }
  }

  debug(message: any, context?: string): void {
    if (dev) {
      super.debug(message, context);
    } else {
      console.debug(`${new Date().toLocaleString(this.locale, this.format)} -`, `${context} -`, message);
    }
  }

  verbose(message: any, context?: string): void {
    if (dev) {
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
    this.verbose(message, 'Request');
  }
}
