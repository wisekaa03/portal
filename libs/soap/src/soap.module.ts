/** @format */

//#region Imports NPM
import { Global, Module } from '@nestjs/common';
//#endregion
//#region Imports Local
import { SoapService } from './soap.service';
//#endregion

@Global()
@Module({
  imports: [],
  providers: [SoapService],
  exports: [SoapService],
})
export class SoapModule {}
