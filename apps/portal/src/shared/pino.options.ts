/** @format */

import pino from 'pino';
import { Params } from 'nestjs-pino';
import { ConfigService } from '@app/config/config.service';

export const pinoOptions = (configService: ConfigService): Params => {
  const development = configService.get<boolean>('DEVELOPMENT');

  return {
    pinoHttp: {
      prettyPrint: development,
      level: configService.get<string>('LOGLEVEL'),
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
