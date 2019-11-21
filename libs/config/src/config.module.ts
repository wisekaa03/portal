/** @format */

// #region Imports NPM
import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigService } from './config.service';
// #endregion
// #region Imports Local
// #endregion

@Global()
@Module({})
export class ConfigModule {
  static register(filepath: string): DynamicModule {
    return {
      module: ConfigModule,
      providers: [{ provide: 'CONFIG_OPTIONS', useValue: filepath }, ConfigService],
      exports: [ConfigService],
    };
  }
}
