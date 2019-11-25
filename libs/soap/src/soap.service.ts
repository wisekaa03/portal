/** @format */

// #region Imports NPM
import { Injectable, Inject } from '@nestjs/common';
import { BasicAuthSecurity, createClientAsync, Client, NTLMSecurity } from 'soap';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config';
import { SoapOptions, SOAP_OPTIONS } from './soap.interface';
// #endregion

@Injectable()
export class SoapService {
  private client: Client;

  private security: NTLMSecurity;

  /**
   * Create an LDAP class.
   *
   * @param {Object} opts - Config options
   * @constructor
   */
  constructor(
    @Inject(SOAP_OPTIONS) private readonly opts: SoapOptions,
    private readonly logger: LogService,
    private readonly configService: ConfigService,
  ) {}

  async connect(): Promise<Client | Error> {
    if (this.opts.user && this.opts.pass) {
      try {
        // this.security = `Basic ${Buffer.from(`${this.opts.user}:${this.opts.pass}`).toString('base64')}`;
        // this.security = new NTLMSecurity(this.opts.user, this.opts.pass, this.opts.domain, this.opts.workstation);
      } catch (error) {
        this.logger.error('SOAP connect error: ', error, 'SOAP Service');

        return error;
      }
    }

    this.opts.options = {
      ...this.opts.options,
      wsdl_headers: { ...(this.opts.options && this.opts.options.wsdl_headers), Authorization: this.security },
    };

    try {
      this.client = await createClientAsync(this.opts.url, this.opts.options, this.opts.endpoint).then(
        (err: Error, client: Client) => {
          client.setSecurity(this.security);

          return client;
        },
      );
    } catch (error) {
      this.logger.error('SOAP connect error: ', error, 'SOAP Service');

      throw error;
    }

    return this.client;
  }

  async method(): Promise<any> {
    // return this.client.
  }
}
