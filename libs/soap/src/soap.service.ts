/** @format */

// #region Imports NPM
import { Injectable, Inject } from '@nestjs/common';
import soap from 'soap';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config';
import { SoapOptions, SOAP_OPTIONS } from './soap.interface';
// #endregion

@Injectable()
export class SoapService {
  private client: soap.Client;

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

  async connect(): Promise<soap.Client> {
    this.client = await soap.createClientAsync(this.opts.url, this.opts.options, this.opts.endpoint);

    return this.client;
  }

  async method(): Promise<any> {
    // return this.client.
  }
}
