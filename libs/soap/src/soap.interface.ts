/** @format */

//#region Imports NPM
import { IOptions } from 'soap';
//#endregion
//#region Imports Local
//#endregion

export interface SoapConnect {
  url: string;
  username: string;
  password: string;
  domain?: string;
  workstation?: string;
  ntlm?: boolean;
  soapOptions?: IOptions;
}

export interface SoapOptions {
  url: string;
  options?: IOptions;
  endpoint?: string;
}
