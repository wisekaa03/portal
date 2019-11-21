/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LoggerModule } from '@app/logger';
import { ConfigModule, ConfigService } from '@app/config';
import { SoapOptions, SoapModule } from '@app/soap';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// #endregion

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV !== 'test';
const env = resolve(__dirname, dev ? (test ? '../../..' : '../../..') : '../../..', '.env');

@Module({
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
})
export class AppModule {}
