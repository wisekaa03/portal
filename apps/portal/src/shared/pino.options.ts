/** @format */

import pino from 'pino';
import { Params } from 'nestjs-pino';

export const pinoOptions = (level = 'debug', development = false): Params => ({
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
});
