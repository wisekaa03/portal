/** @format */

// #region Imports NPM
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Type } from '@nestjs/common';
import { IOptions } from 'soap';
// #endregion
// #region Imports Local
// #endregion

export const SOAP_OPTIONS = 'SOAP_OPTIONS';

export interface SoapAuthentication {
  username: string;
  password: string;
  domain?: string;
  workstation?: string;
}

export interface SoapOptions {
  url: string;
  options?: IOptions;
  endpoint?: string;
}

export interface SoapOptionsFactory {
  createSoapOptions(): Promise<SoapOptions> | SoapOptions;
}

export interface SoapModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<SoapOptionsFactory>;
  useClass?: Type<SoapOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<SoapOptions> | SoapOptions;
  inject?: any[];
}
