/** @format */

// #region Imports NPM
import { Module } from '@nestjs/common';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LoggerModule } from '@app/logger';
import { SoapModule } from '@app/soap';
import { OldTicketResolver } from './old-service.resolver';
import { OldTicketService } from './old-service.service';
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
              domain: configService.get<string>('SOAP_DOMAIN'),
            },
          },
        };
      },
    }),
  ],

  providers: [OldTicketResolver, OldTicketService],
})
export class TicketOldServiceModule {}
