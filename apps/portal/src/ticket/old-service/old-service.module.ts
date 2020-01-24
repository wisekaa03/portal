/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule } from '@app/logger';
import { SoapModule } from '@app/soap';
import { TicketOldServiceResolver } from './old-service.resolver';
import { TicketOldService } from './old-service.service';
// #endregion

@Module({
  imports: [
    // #region Config & Log module
    ConfigModule,
    LoggerModule,
    // #endregion

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
              domain: configService.get<string>('SOAP_DOMAIN'),
            },
          },
        };
      },
    }),
  ],

  providers: [TicketOldServiceResolver, TicketOldService],
})
export class TicketOldServiceModule {}
