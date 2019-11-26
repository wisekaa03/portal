/** @format */

// #region Imports NPM
import { resolve } from 'path';
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule } from '@app/logger';
import { SoapModule } from './soap.module';
import { SoapService } from './soap.service';
import { SoapOptions } from './soap.interface';
// #endregion

const dev = process.env.NODE_ENV !== 'production';
const test = process.env.NODE_ENV !== 'test';
const env = resolve(__dirname, dev ? (test ? '../../..' : '../../..') : '../../..', '.env');

describe('SoapService', () => {
  let service: SoapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.register(env),
        LoggerModule,

        SoapModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            return {
              url: configService.get<string>('SOAP_URL'),
              options: {
                wsdl_headers: {
                  connection: 'keep-alive',
                },
                wsdl_options: {
                  ntlm: true,
                  username: configService.get<string>('SOAP_USER'),
                  password: configService.get<string>('SOAP_PASS'),
                },
              },
            };
          },
        }),
      ],
      providers: [SoapService],
    }).compile();

    service = module.get<SoapService>(SoapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
