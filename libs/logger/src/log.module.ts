/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
// eslint-disable-next-line import/no-extraneous-dependencies
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { pinoOptions } from '@back/shared/pino.options';
import { LogService } from './log.service';
// #endregion

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => pinoOptions(config.get<string>('LOGLEVEL')),
    }),
  ],
  providers: [{ provide: 'pino-params', useValue: {} }, LogService],
  exports: [LogService],
})
export class LogModule {}
