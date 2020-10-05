/** @format */

//#region Imports NPM
import { Injectable, Inject } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
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
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly soapService: SoapService,
  ) {}
}
