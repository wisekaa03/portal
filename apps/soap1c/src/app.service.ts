/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { SoapService } from '@app/soap';
// #endregion

@Injectable()
export class AppService {
  constructor(private readonly soapService: SoapService) {}

  async getHello(): Promise<any> {
    return this.soapService.connect();
  }
}
