/** @format */

//#region Imports NPM
import { Injectable, HttpService } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import {
  TkRoutes,
  TkTasks,
  TkEditTask,
  TkWhere,
  TkUserOST,
  TkTaskNewInput,
  TkTaskNew,
  TkTaskEditInput,
  TkTaskDescriptionInput,
  RecordsOST,
  TkFileInput,
  TkFile,
  TicketsRouteSOAP,
  TicketsUserSOAP,
  TicketsTaskSOAP,
  TicketsSOAPGetRoutes,
  TicketsSOAPGetTasks,
  TicketsSOAPGetTaskDescription,
} from '@lib/types/tickets';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
import { SoapService, SoapFault, soapError, SoapAuthentication } from '@app/soap';
import type { DocFlowTask } from '@lib/types/docflow';
import { constructUploads } from '@back/shared/upload';
import { DataResultSOAP } from '@lib/types/common';
//#endregion

const MockDocFlowGetTask = [
  {
    task: 'Test 0001',
    author: 'What?',
    date: new Date(),
  },
  {
    task: 'Test 0002',
    author: 'What?',
    date: new Date(),
  },
];

/**
 * Tickets class
 * @class
 */
@Injectable()
export class DocFlowService {
  constructor(
    @InjectPinoLogger(DocFlowService.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly soapService: SoapService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * DocFlow tasks list
   *
   * @async
   * @method DocFlowGetTasks
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowTask[]}
   */
  DocFlowGetTasks = async (user: User, password: string): Promise<DocFlowTask[]> => {
    if (this.configService.get<string>('DOCFLOW_URL')) {
      const authentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('LDAP_DOMAIN'),
      } as SoapAuthentication;

      const client = await this.soapService.connect(authentication).catch((error: Error) => {
        throw error;
      });

      if (client) {
        return client
          .execute({
            $value: 'xsi:type="dm:DMGetObjectListRequest"',
            request: {
              dataBaseID: null,
              type: 'DMBusinessProcessTask',
            },
          })
          .then((result: DataResultSOAP<any>) => {
            this.logger.info(`${DocFlowService.name}: [Request] ${client.lastRequest}`);
            this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);

            throw new Error('Not connected to SOAP');
          })
          .catch((error: Error | SoapFault) => {
            this.logger.info(`${DocFlowService.name}: [Request] ${client.lastRequest}`);
            if (error instanceof Error) {
              this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);
              this.logger.error(error);

              throw error;
            }
            this.logger.error(error);

            throw new Error(`${DocFlowService.name}: ${soapError(error)}`);
          });
      }
    }

    throw new Error('Not allowed');
  };
}
