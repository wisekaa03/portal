/** @format */

// #region Imports NPM
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { NextService } from './next/next.service';
import { HttpErrorFilter } from './filters/http-error.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { NextModule } from './next/next.module';
import { LoggerModule } from './logger/logger.module';
import { LoggerService } from './logger/logger.service';
// #endregion

@Module({
  imports: [
    // #region NextModule
    NextModule,
    // #endregion

    // #region LoggerModule
    LoggerModule,
    // #endregion
  ],
  providers: [
    // #region Errors: ExceptionFilter
    {
      provide: APP_FILTER,
      inject: [NextService, LoggerService],
      useFactory: (nextService: NextService, loggerService: LoggerService) => {
        return new HttpErrorFilter(nextService, loggerService);
      },
    },
    // #endregion
    // #region Logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // #endregion
  ],
  exports: [NextModule, LoggerModule],
})
export class ApiModule {}
