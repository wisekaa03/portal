/** @format */

//#region Imports NPM
import { Module, HttpModule } from '@nestjs/common';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { SoapModule } from '@app/soap';
import { DocFlowResolver } from './docflow.resolver';
import { DocFlowService } from './docflow.service';
//#endregion

@Module({
  imports: [
    SoapModule.registerAsync({
      name: 'DOCFLOW',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        url: configService.get<string>('DOCFLOW_URL'),
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

  providers: [DocFlowService, DocFlowResolver],
})
export class DocFlowModule {}
