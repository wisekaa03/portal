/** @format */

import { utilities as nestWinstonModuleUtilities, WinstonModuleOptions } from 'nest-winston';
import winston from 'winston';

export const winstonOptions = (): WinstonModuleOptions => ({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.timestamp(), nestWinstonModuleUtilities.format.nestLike()),
    }),
  ],
});
