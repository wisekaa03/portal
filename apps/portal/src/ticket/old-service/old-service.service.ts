/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { SoapService } from '@app/soap';
import { Route } from './models/old-service.interface';
// #endregion

@Injectable()
export class TicketOldService {
  constructor(private readonly logService: LogService, private readonly soapService: SoapService) {}

  /**
   * Reads by Username
   *
   * @returns {Routes[]} Services and Categories
   */
  GetRoutes = async (username: string, password: string): Promise<Route[]> => {
    return (this.soapService.connect(username, password) as unknown) as Route[];
  };
}
