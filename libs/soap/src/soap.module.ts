/** @format */

import { Module } from '@nestjs/common';
import { SoapService } from './soap.service';

@Module({
  providers: [SoapService],
  exports: [SoapService],
})
export class SoapModule {}
