/** @format */
/* eslint max-classes-per-file:0 */

//#region Imports NPM
import { Injectable, Inject } from '@nestjs/common';
import { createClientAsync, Client, NTLMSecurity, ISoapFaultError, ISoapFault11, ISoapFault12 } from 'soap';
import { LoggerContext } from 'nestjs-ldap';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import type { SoapOptions, SoapConnect } from './soap.interface';
//#endregion

export type SoapClient = Client;
export type SoapFault = ISoapFaultError;

export function soapError(error: ISoapFaultError | Error): string {
  return error instanceof Error
    ? error.message
    : typeof (error.Fault as ISoapFault11).faultstring === 'string'
    ? (error.Fault as ISoapFault11).faultstring
    : (error.Fault as ISoapFault12).Reason.Text;
}

@Injectable()
export class SoapService {
  /**
   * Create an LDAP class.
   *
   * @param {Object} options - Config options
   * @constructor
   */
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger, private readonly configService: ConfigService) {}

  /**
   * Connect the SOAP service
   *
   * @param {SoapConnect} connect: url, username, password, ntlm
   * @returns {SoapClient} Client with the needed SOAP functions
   * @throws {Error}
   */
  async connect(connect: SoapConnect, loggerContext?: LoggerContext): Promise<SoapClient> {
    let options: SoapOptions;

    if (connect.ntlm) {
      options = {
        url: connect.url,
        options: {
          wsdl_headers: {
            connection: 'keep-alive',
          },
          wsdl_options: {
            username: connect.username,
            password: connect.password,
            domain: connect.domain,
            workstation: connect.workstation,
            ntlm: true,
          },
          ...connect.soapOptions,
        },
      };
    } else {
      options = {
        url: connect.url,
        options: {
          wsdl_options: {
            username: connect.username,
            password: connect.password,
            basic: true,
          },
          ...connect.soapOptions,
        },
      };
    }

    return createClientAsync(options.url, options.options, options.endpoint)
      .then((client: Client) => {
        if (connect.ntlm) {
          client.setSecurity(new NTLMSecurity(connect));
        }
        return client as SoapClient;
      })
      .catch((error: ISoapFaultError | Error) => {
        this.logger.error(`SOAP connect error: ${error.toString()}`, { error, loggerContext });

        throw error;
      });
  }
}
