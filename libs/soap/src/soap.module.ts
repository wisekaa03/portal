/** @format */

// #region Imports NPM
import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
// #endregion
// #region Imports Local
import { SOAP_OPTIONS, SoapOptions, SoapOptionsFactory, SoapModuleAsyncOptions } from './soap.interface';
import { SoapService } from './soap.service';
// #endregion

@Module({
  imports: [],
  providers: [SoapService],
  exports: [SoapService],
})
export class SoapModule {
  static register(options: SoapOptions): DynamicModule {
    return {
      module: SoapModule,
      providers: [{ provide: SOAP_OPTIONS, useValue: options || {} }, SoapService],
    };
  }

  static registerAsync(options: SoapModuleAsyncOptions): DynamicModule {
    return {
      module: SoapModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
    };
  }

  private static createAsyncProviders(options: SoapModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass as Type<SoapOptionsFactory>,
        useClass: options.useClass as Type<SoapOptionsFactory>,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: SoapModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: SOAP_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: SOAP_OPTIONS,
      useFactory: async (optionsFactory: SoapOptionsFactory) => optionsFactory.createSoapOptions(),
      inject: [(options.useExisting as Type<SoapOptionsFactory>) || (options.useClass as Type<SoapOptionsFactory>)],
    };
  }
}
