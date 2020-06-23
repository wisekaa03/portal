/** @format */

//#region Imports NPM
import { resolve } from 'path';
import { PinoLogger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config/config.service';
import { LoggingInterceptor } from './logging.interceptor';
//#endregion

jest.mock('@app/config/config.service', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
  })),
}));

const interceptor = new LoggingInterceptor(new PinoLogger({}), new ConfigService(resolve('.local/.env')));

describe('LoggingInterceptor', () => {
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
