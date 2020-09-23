/** @format */

//#region Imports NPM
import { Injectable, HttpService } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
import { SoapService } from '@app/soap';
import { constructUploads } from '@back/shared/upload';
import { DataResultSOAP } from '@lib/types/common';
//#endregion

/**
 * Tickets class
 * @class
 */
@Injectable()
export class ReportsService {
  constructor(
    @InjectPinoLogger(ReportsService.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly soapService: SoapService,
  ) {}
}
