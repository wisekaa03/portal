/** @format */

//#region Imports NPM
import { Injectable, Inject, LoggerService, Logger } from '@nestjs/common';
// import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { User } from '@back/user/user.entity';
import { ConfigService } from '@app/config/config.service';
import { SoapService } from '@app/soap';
// import { constructUploads } from '@back/shared/constructUploads';
//#endregion

/**
 * Tickets class
 * @class
 */
@Injectable()
export class ReportsService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly soapService: SoapService,
  ) {}
}
