/** @format */

// eslint-disable-next-line import/no-extraneous-dependencies
import pino from 'pino';
import { Params } from 'nestjs-pino';

export const pinoOptions = (level: string): Params => ({
  pinoHttp: {
    prettyPrint: __DEV__,
    level,
    autoLogging: !__DEV__,
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
