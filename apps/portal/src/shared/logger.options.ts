/** @format */

import type { Request } from 'express';
import { utilities as nestWinstonModuleUtilities, WinstonModuleOptions } from 'nest-winston';
import winston from 'winston';
import { WinstonGraylog } from '@pskzcompany/winston-graylog';
import { ConfigService } from '@app/config/config.service';

export const winstonOptions = (configService?: ConfigService): WinstonModuleOptions => {
  let level = 'debug';
  let graylog: string | undefined;
  let development = true;

  if (configService) {
    level = configService.get<string>('LOG_LEVEL') || 'debug';
    graylog = configService.get<string>('LOG_SERVER');
    development = configService.get<boolean>('DEVELOPMENT');
  }

  const options = {
    level,
    exitOnError: false,
    transports: [
      new winston.transports.Console({
        level,
        format: winston.format.combine(winston.format.timestamp(), nestWinstonModuleUtilities.format.nestLike()),
      }) as winston.transport,
    ],
  };

  if (graylog) {
    options.transports.push(
      new WinstonGraylog({
        level,
        graylog,
        defaultMeta: {
          environment: development ? 'development' : 'production',
          username: (req: Request) => {
            // eslint-disable-next-line no-debugger
            debugger;

            return req?.user?.username;
          },
        },
      }) as winston.transport,
    );
  }

  return options;
};
