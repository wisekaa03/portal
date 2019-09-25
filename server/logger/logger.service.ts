/** @format */

// #region Imports NPM
import { Logger } from '@nestjs/common';
// #endregion

const dev = process.env.NODE_ENV !== 'production';

export class AppLogger extends Logger {
  log(message: any, context?: string): void {
    if (dev) {
      super.log(message, context);
    } else {
      console.log(context, message);
    }
  }

  error(message: any, trace?: string, context?: string): void {
    if (dev) {
      super.error(message, trace, context);
    } else {
      console.error(context, message, trace);
    }
  }

  warn(message: any, context?: string): void {
    if (dev) {
      super.warn(message, context);
    } else {
      console.warn(context, message);
    }
  }

  debug(message: any, context?: string): void {
    if (dev) {
      super.debug(message, context);
    } else {
      console.debug(context, message);
    }
  }

  verbose(message: any, context?: string): void {
    if (dev) {
      super.verbose(message, context);
    } else {
      console.info(context, message);
    }
  }
}
