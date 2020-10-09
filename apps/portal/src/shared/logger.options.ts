/** @format */

import type { Format } from 'logform';
import bare from 'cli-color/bare';
import clc from 'cli-color';
import safeStringify from 'fast-safe-stringify';
import type { WinstonModuleOptions } from 'nest-winston';
import winston from 'winston';
import { WinstonGraylog } from '@pskzcompany/winston-graylog';
import { ConfigService } from '@app/config/config.service';

const nestLikeColorScheme: Record<string, bare.Format> = {
  info: clc.greenBright,
  error: clc.red,
  warn: clc.yellow,
  debug: clc.magentaBright,
  verbose: clc.cyanBright,
};

const nestLike = (): Format =>
  winston.format.printf(({ context, level, timestamp, message, ...meta }) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const color = nestLikeColorScheme[level] || ((text: string): string => text);

    return `${`${clc.yellow(level.charAt(0).toUpperCase() + level.slice(1))}\t`}${
      typeof timestamp !== 'undefined' ? `${new Date(timestamp).toLocaleString()} ` : ''
    }${typeof context !== 'undefined' ? `${clc.yellow(`[${context}]`)} ` : ''}${color(message)} - ${safeStringify(meta)}`;
  });

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
    // exitOnError: true,
    handleExceptions: false,
    transports: [
      new winston.transports.Console({
        level,
        format: winston.format.combine(winston.format.timestamp(), nestLike()),
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
        },
      }) as winston.transport,
    );
  }

  return options;
};
