/** @format */

export interface EnvConfig<T> {
  [key: string]: T;
}

export class ConfigServiceMock {
  private readonly envConfig: EnvConfig<any>;
}
