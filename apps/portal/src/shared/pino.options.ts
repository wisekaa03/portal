/** @format */

import pino from 'pino';
import { Params } from 'nestjs-pino';
import { ConfigService } from '@app/config/config.service';

export const pinoOptions = (configService?: ConfigService): Params => {
  const development = configService?.get<boolean>('DEVELOPMENT') || true;
  const level = configService?.get<string>('LOG_LEVEL') || 'debug';

  return {
    pinoHttp: {
      prettyPrint: development,
      level,
      autoLogging: !development,
      timestamp: pino.stdTimeFunctions.isoTime,
      // serializers: {
      //   req: (req: any) => {
      //     return {
      //       message: req.raw.user,
      //     };
      //   },
      // },
    },
  };
};
