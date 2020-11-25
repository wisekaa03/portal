/** @format */

//#region Imports NPM
import { Global, Logger, Module } from '@nestjs/common';
//#endregion
//#region Imports Local
import { SoapService } from './soap.service';
//#endregion

@Global()
@Module({
  imports: [],
  providers: [Logger, SoapService],
  exports: [SoapService],
})
export class SoapModule {}
