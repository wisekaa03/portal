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
import { SoapService, SoapFault, soapError } from '@app/soap';
import type { DocFlowTask, DocFlowTaskSOAP, DocFlowTasksSOAP } from '@lib/types/docflow';
import { constructUploads } from '@back/shared/upload';
import { DataResultSOAP } from '@lib/types/common';
import { docFlowTask } from './docflow.utils';
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
    const soapUrl = this.configService.get<string>('DOCFLOW_URL');
    if (soapUrl) {
      const client = await this.soapService
        .connect({
          url: soapUrl,
          username: user?.username,
          password,
          domain: this.configService.get<string>('LDAP_DOMAIN'),
          ntlm: true,
          soapOptions: {
            namespaceArrayElements: false,
          },
        })
        .catch((error: Error) => {
          throw error;
        });

      if (client) {
        return client
          .executeAsync({
            'tns:request': {
              'attributes': {
                'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
                'xsi:type': 'tns:DMGetObjectListRequest',
              },
              'tns:dataBaseID': '',
              'tns:type': 'DMBusinessProcessTask',
              'tns:query': [
                {
                  'tns:conditions': {
                    'tns:property': 'byUser',
                    'tns:value': {
                      attributes: {
                        'xsi:type': 'xs:boolean',
                      },
                      $value: true,
                    },
                  },
                },
                {
                  'tns:conditions': {
                    'tns:property': 'typed',
                    'tns:value': {
                      attributes: {
                        'xsi:type': 'xs:boolean',
                      },
                      $value: true,
                    },
                  },
                },
                {
                  'tns:conditions': {
                    'tns:property': 'withDelayed',
                    'tns:value': {
                      attributes: {
                        'xsi:type': 'xs:boolean',
                      },
                      $value: false,
                    },
                  },
                },
                {
                  'tns:conditions': {
                    'tns:property': 'withExecuted',
                    'tns:value': {
                      attributes: {
                        'xsi:type': 'xs:boolean',
                      },
                      $value: false,
                    },
                  },
                },
              ],
            },
          })
          .then((message: DataResultSOAP<DocFlowTasksSOAP>) => {
            this.logger.info(`${DocFlowService.name}: [Request] ${client.lastRequest}`);
            // this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);

            if (message[0]?.return) {
              const result = message[0]?.return?.items?.map((task) => docFlowTask(task));

              return result;
            }

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
