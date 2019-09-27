/** @format */

// #region Imports NPM
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Module, forwardRef } from '@nestjs/common';
// #endregion
// #region Imports Local
import { NextService } from './next/next.service';
import { HttpErrorFilter } from './shared/http-error.filter';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { UserModule } from './user/user.module';
import { NextModule } from './next/next.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { LoggerService } from './logger/logger.service';
// #endregion

@Module({
  imports: [
    // #region Authentication
    forwardRef(() => AuthModule),
    // #endregion

    // #region Users
    forwardRef(() => UserModule),
    // #endregion

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
  exports: [UserModule, AuthModule, NextModule, LoggerModule],
})
export class ApiModule {}
