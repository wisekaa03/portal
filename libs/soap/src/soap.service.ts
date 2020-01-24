/** @format */

// #region Imports NPM
import { Injectable, Inject } from '@nestjs/common';
import { createClientAsync, Client, NTLMSecurity } from 'soap';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config';
import { SoapOptions, SOAP_OPTIONS } from './soap.interface';
// #endregion

export type SOAPClient = Client;

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
    private readonly logger: LogService,
    private readonly configService: ConfigService,
  ) {}

  async connect(username?: string, password?: string, domain?: string, workstation?: string): Promise<SOAPClient> {
    if (username && password) {
      this.opts.options = {
        ...this.opts.options,

        wsdl_headers: {
          connection: 'keep-alive',
        },
        wsdl_options: {
          ntlm: true,
          username,
          password,
          domain,
          workstation,
        },
      };
    }

    return createClientAsync(this.opts.url, this.opts.options, this.opts.endpoint)
      .then((client: Client) => {
        if (this.opts.options && this.opts.options.wsdl_options && this.opts.options.wsdl_options.ntlm) {
          client.setSecurity(new NTLMSecurity(this.opts.options.wsdl_options));
        }
        return client as SOAPClient;
      })
      .catch((error: Error) => {
        this.logger.error('SOAP connect error: ', JSON.stringify(error), 'SOAP Service');

        throw error;
      });
  }
}
