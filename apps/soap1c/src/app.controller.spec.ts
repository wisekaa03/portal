/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { SoapModule, SoapOptions } from '@app/soap';
import { LoggerModule } from '@app/logger';
import { ConfigModule, ConfigService } from '@app/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// #endregion

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV === 'test';
const env = resolve(__dirname, dev ? (test ? '../../..' : '../../..') : '../../..', '.env');

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        ConfigModule.register(env),

        SoapModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              url: configService.get<string>('SOAP_URL'),
              options: { disableCache: true },
            } as SoapOptions;
          },
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('"synchronization" should be defined', () => {
      expect(appController.synchronization()).toBeDefined();
    });
  });
});
