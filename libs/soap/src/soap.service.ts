/** @format */

// #region Imports NPM
import { Injectable, Inject } from '@nestjs/common';
import { createClientAsync, Client, NTLMSecurity, ISoapFaultError, ISoapFault11, ISoapFault12 } from 'soap';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { SoapOptions, SOAP_OPTIONS, SoapAuthentication } from './soap.interface';
// #endregion

export type SoapClient = Client;
export type SoapFault = ISoapFaultError;

export const SoapError = (error: ISoapFaultError): string => JSON.stringify(error.Fault);

@Injectable()
export class SoapService {
  /**
   * Create an LDAP class.
   *
   * @param {Object} opts - Config options
   * @constructor
   */
  constructor(
    @Inject(SOAP_OPTIONS) public readonly opts: SoapOptions,
    @InjectPinoLogger(SoapService.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {}

  async connect(authentication?: SoapAuthentication): Promise<SoapClient> {
    if (authentication && authentication.username && authentication.password) {
      this.opts.options = {
        ...this.opts.options,

        wsdl_headers: {
          connection: 'keep-alive',
        },
        wsdl_options: {
          ntlm: true,
          ...authentication,
        },
      };
    }

    return createClientAsync(this.opts.url, this.opts.options, this.opts.endpoint)
      .then((client: Client) => {
        if (this.opts.options && this.opts.options.wsdl_options && this.opts.options.wsdl_options.ntlm) {
          client.setSecurity(new NTLMSecurity(this.opts.options.wsdl_options));
        }
        return client as SoapClient;
      })
      .catch((error: SoapFault) => {
        this.logger.error('SOAP connect error: ', error.toString());

        throw SoapError(error);
      });
  }
}
