/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { Client } from 'soap';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { SoapService } from '@app/soap';
import { Route } from './models/old-service.interface';
// #endregion

@Injectable()
export class TicketOldService {
  private client: Client;

  constructor(private readonly logService: LogService, private readonly soapService: SoapService) {}

  /**
   * Reads by Username
   *
   * @returns {Routes[]} Services and Categories
   */
  GetRoutes = async (username: string, password: string): Promise<Route[]> => {
    if (!this.client) {
      this.client = await this.soapService.connect(username, password).catch((error) => {
        throw error;
      });
    }

    if (this.client) {
      return this.client.kngk_GetRoutesAsync({ log: username });
    }

    throw new Error('Unexpected SOAP error.');
  };
}
