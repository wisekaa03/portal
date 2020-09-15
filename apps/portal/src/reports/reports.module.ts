/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
//#endregion
//#region Imports Local
import { ConfigModule, ConfigService } from '@app/config';
import { SoapModule } from '@app/soap';
import { ReportsResolver } from './reports.resolver';
import { ReportsService } from './reports.service';
//#endregion

@Module({
  imports: [
    SoapModule.registerAsync({
      name: 'REPORT',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        url: configService.get<string>('REPORTS_URL'),
        options: {
          wsdl_headers: {
            connection: 'keep-alive',
          },
          wsdl_options: {
            ntlm: true,
            domain: configService.get<string>('LDAP_DOMAIN'),
          },
        },
      }),
    }),

    HttpModule,
  ],

  providers: [ReportsService, ReportsResolver],
})
export class ReportsModule {}
