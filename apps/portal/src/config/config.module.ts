/** @format */

// #region Imports NPM
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
// #endregion
// #region Imports Local
// #endregion

@Module({
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService(join(process.cwd(), '../../.env')),
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
