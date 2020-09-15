/** @format */
/* eslint max-classes-per-file:0 */

//#region Imports NPM
import { Injectable, Inject, Scope } from '@nestjs/common';
import { createClientAsync, Client, NTLMSecurity, ISoapFaultError, ISoapFault11, ISoapFault12 } from 'soap';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { SoapOptions, SOAP_OPTIONS, SoapAuthentication } from './soap.interface';
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

@Injectable({ scope: Scope.TRANSIENT })
export class SoapService {
  /**
   * Create an LDAP class.
   *
   * @param {Object} options - Config options
   * @constructor
   */
  constructor(
    @Inject(SOAP_OPTIONS) public readonly options: SoapOptions,
    @InjectPinoLogger(SoapService.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    // eslint-disable-next-line no-debugger
    debugger;
  }

  /**
   * Connect the SOAP service
   *
   * @param {SoapAuthentication} authentication SOAP authentication
   * @returns {SoapClient} Client with the needed SOAP functions
   * @throws {Error}
   */
  async connect(authentication?: SoapAuthentication): Promise<SoapClient> {
    if (authentication && authentication.username && authentication.password) {
      this.options.options = {
        ...this.options.options,

        wsdl_headers: {
          connection: 'keep-alive',
        },
        wsdl_options: {
          ntlm: true,
          ...authentication,
        },
      };
    }

    return createClientAsync(this.options.url, this.options.options, this.options.endpoint)
      .then((client: Client) => {
        if (this.options.options?.wsdl_options?.ntlm) {
          client.setSecurity(new NTLMSecurity(this.options.options.wsdl_options));
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
