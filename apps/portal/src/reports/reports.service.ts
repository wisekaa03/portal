/** @format */

//#region Imports NPM
import { Injectable, Inject, LoggerService, Logger } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
import { SoapService } from '@app/soap';
import { constructUploads } from '@back/shared/upload';
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
