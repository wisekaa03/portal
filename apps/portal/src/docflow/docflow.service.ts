/** @format */

//#region Imports NPM
import { Inject, Injectable, HttpService } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as cacheManager from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
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
import type {
  DocFlowTask,
  DocFlowTaskSOAP,
  DocFlowTasksSOAP,
  DocFlowTasksInput,
  DocFlowTaskInput,
  DocFlowFile,
  DocFlowFileInput,
} from '@lib/types/docflow';
import { constructUploads } from '@back/shared/upload';
import { PortalError } from '@back/shared/errors';
import { DataResultSOAP } from '@lib/types/common';
import { docFlowTask } from './docflow.utils';
//#endregion

/**
 * Tickets class
 * @class
 */
@Injectable()
export class DocFlowService {
  private ttl: number;
  private cacheStore: cacheManager.Store;
  private cache: cacheManager.Cache;

  constructor(
    @InjectPinoLogger(DocFlowService.name) private readonly logger: PinoLogger,
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
    private readonly configService: ConfigService,
    private readonly soapService: SoapService,
  ) {
    this.ttl = configService.get<number>('DOCFLOW_REDIS_TTL') || 900;
    if (configService.get<string>('DOCFLOW_REDIS_URI')) {
      this.cacheStore = redisStore.create({
        prefix: 'DOCFLOW',
        url: configService.get<string>('DOCFLOW_REDIS_URI'),
      });
      this.cache = cacheManager.caching({
        store: this.cacheStore,
        ttl: this.ttl,
      });
      logger.info('Redis connection: success');
    }
  }

  /**
   * DocFlow tasks list
   *
   * @async
   * @method DocFlowGetTasks
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowTask[]}
   */
  docFlowGetTasks = async (user: User, password: string, tasks?: DocFlowTasksInput): Promise<DocFlowTask[]> => {
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
          this.logger.error(error);

          throw new Error(PortalError.SOAP_NOT_AUTHORIZED);
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

            throw new Error(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowGetTasks: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowGetTasks: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new Error(PortalError.SOAP_NOT_AUTHORIZED);
          });
      }
    }

    throw new Error('Not allowed');
  };

  /**
   * DocFlow tasks list (cache)
   *
   * @async
   * @method DocFlowGetTasksCache
   * @param {User} user User object
   * @param {string} password The Password
   * @param {task}
   * @returns {DocFlowTask[]}
   */
  docFlowGetTasksCache = async (user: User, password: string, tasks?: DocFlowTasksInput): Promise<DocFlowTask[]> => {
    const cachedID = `${user.loginIdentificator}-docflow-tasks`;
    if (this.cache && (!tasks || tasks.cache !== false)) {
      const cached: DocFlowTask[] = await this.cache.get<DocFlowTask[]>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          const ticketsTasks = await this.docFlowGetTasks(user, password, tasks);
          this.pubSub.publish('docFlowTasks', {
            user: user.loginIdentificator,
            ticketsTasks,
          });
          this.cache.set(cachedID, ticketsTasks, this.ttl);
        })();

        return cached;
      }
    }

    const ticketsTasks = await this.docFlowGetTasks(user, password, tasks);
    this.pubSub.publish('docFlowTasks', { user: user.loginIdentificator, ticketsTasks });

    if (this.cache) {
      this.cache.set<DocFlowTask[]>(cachedID, ticketsTasks, this.ttl);
    }

    return ticketsTasks;
  };

  /**
   * DocFlow get task
   *
   * @async
   * @method DocFlowGetTask
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowTask}
   */
  docFlowGetTask = async (user: User, password: string, task?: DocFlowTaskInput): Promise<DocFlowTask> => {
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
          this.logger.error(error);

          throw new Error(PortalError.SOAP_NOT_AUTHORIZED);
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
              const result = message[0]?.return?.items?.map((t) => docFlowTask(t));

              return result;
            }

            throw new Error(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowGetTasks: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowGetTasks: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new Error(PortalError.SOAP_NOT_AUTHORIZED);
          });
      }
    }

    throw new Error(PortalError.NOT_IMPLEMENTED);
  };

  /**
   * DocFlow task get (cache)
   *
   * @async
   * @method DocFlowGetTasksCache
   * @param {User} user User object
   * @param {string} password The Password
   * @param {task}
   * @returns {DocFlowTask}
   */
  docFlowGetTaskCache = async (user: User, password: string, task?: DocFlowTaskInput): Promise<DocFlowTask> => {
    const cachedID = `${user.loginIdentificator}-docflow-task`;
    if (this.cache && (!task || task.cache !== false)) {
      const cached: DocFlowTask = await this.cache.get<DocFlowTask>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          const ticketsTasks = await this.docFlowGetTask(user, password, task);
          this.pubSub.publish('docFlowTask', {
            user: user.loginIdentificator,
            ticketsTasks,
          });
          this.cache.set(cachedID, ticketsTasks, this.ttl);
        })();

        return cached;
      }
    }

    const ticketsTask = await this.docFlowGetTask(user, password, task);
    this.pubSub.publish('docFlowTask', { user: user.loginIdentificator, ticketsTask });

    if (this.cache) {
      this.cache.set<DocFlowTask>(cachedID, ticketsTask, this.ttl);
    }

    return ticketsTask;
  };

  /**
   * DocFlow get file
   *
   * @async
   * @method DocFlowGetFile
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowFile}
   */
  docFlowGetFile = async (user: User, password: string, file?: DocFlowFileInput): Promise<DocFlowFile> => {
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
          this.logger.error(error);

          throw new Error(PortalError.SOAP_NOT_AUTHORIZED);
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
              const result = message[0]?.return?.items?.map((t) => docFlowTask(t));

              return result;
            }

            throw new Error(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowGetTasks: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowGetTasks: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new Error(PortalError.SOAP_NOT_AUTHORIZED);
          });
      }
    }

    throw new Error(PortalError.NOT_IMPLEMENTED);
  };

  /**
   * DocFlow task get (cache)
   *
   * @async
   * @method DocFlowGetFileCache
   * @param {User} user User object
   * @param {string} password The Password
   * @param {task}
   * @returns {DocFlowTask[]}
   */
  docFlowGetFileCache = async (user: User, password: string, file?: DocFlowFileInput): Promise<DocFlowFile> => {
    const cachedID = `${user.loginIdentificator}-docflow-file`;
    if (this.cache && (!file || file.cache !== false)) {
      const cached: DocFlowFile = await this.cache.get<DocFlowFile>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          const ticketsTasks = await this.docFlowGetFile(user, password, file);
          this.pubSub.publish('docFlowFile', {
            user: user.loginIdentificator,
            ticketsTasks,
          });
          this.cache.set(cachedID, ticketsTasks, this.ttl);
        })();

        return cached;
      }
    }

    const ticketsFile = await this.docFlowGetFile(user, password, file);
    this.pubSub.publish('docFlowFile', { user: user.loginIdentificator, ticketsFile });

    if (this.cache) {
      this.cache.set<DocFlowFile>(cachedID, ticketsFile, this.ttl);
    }

    return ticketsFile;
  };
}
