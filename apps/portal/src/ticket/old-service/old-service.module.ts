/** @format */

// #region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
// #endregion
// #region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { LogModule } from '@app/logger';
import { SoapModule } from '@app/soap';
import { OldTicketResolver } from './old-service.resolver';
import { OldTicketService } from './old-service.service';
// #endregion

@Module({
  imports: [
    // #region Log module
    LogModule,
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

    HttpModule,
  ],

  providers: [OldTicketResolver, OldTicketService],
})
export class TicketOldServiceModule {}
