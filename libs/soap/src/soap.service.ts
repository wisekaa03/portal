/** @format */
/* eslint max-classes-per-file:0 */

//#region Imports NPM
import { Injectable } from '@nestjs/common';
import { createClientAsync, Client, NTLMSecurity, ISoapFaultError, ISoapFault11, ISoapFault12 } from 'soap';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
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
  constructor(@InjectPinoLogger(SoapService.name) private readonly logger: PinoLogger, private readonly configService: ConfigService) {}

  /**
   * Connect the SOAP service
   *
   * @param {SoapConnect} connect: url, username, password, ntlm
   * @returns {SoapClient} Client with the needed SOAP functions
   * @throws {Error}
   */
  async connect(connect: SoapConnect): Promise<SoapClient> {
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
        const message = error.toString();
        this.logger.error(`SOAP connect error: ${message}`, [{ error }]);

        throw new Error(soapError(error));
      });
  }
}
