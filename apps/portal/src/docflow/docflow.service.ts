/** @format */

//#region Imports NPM
import {
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
  NotImplementedException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as cacheManager from 'cache-manager';
import * as redisStore from 'cache-manager-redis-store';
//#endregion
//#region Imports Local
import { TIMEOUT_REFETCH_SERVICES, TIMEOUT, PortalPubSub } from '@back/shared/constants';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
import { SoapService, SoapClient } from '@app/soap';
import type {
  DocFlowTask,
  DocFlowTasksInput,
  DocFlowTaskInput,
  DocFlowTargetInput,
  DocFlowTarget,
  DocFlowFileInput,
  DocFlowFile,
  DocFlowFiles,
  DocFlowUser,
  DocFlowUserInput,
} from '@lib/types/docflow';
import type { SubscriptionPayload, DocFlowTaskSOAP, DocFlowUserSOAP, DocFlowTargetsSOAP, DocFlowFileSOAP } from '@back/shared/types';
import { constructUploads } from '@back/shared/upload';
import { PortalError } from '@back/shared/errors';
import type { DataReturn, DataResult, DataFiles, DataItems, DataUser } from '@lib/types/common';
import { docFlowTask, docFlowUser, docFlowTargets, docFlowFile } from './docflow.utils';
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

  docFlowFiles = async (soap: SoapClient, target: DocFlowTarget): Promise<DocFlowFiles> => {
    const request = {
      'tns:request': {
        'attributes': {
          'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
          'xsi:type': 'tns:DMGetFileListByOwnerRequest',
        },
        'tns:dataBaseID': '',
        'tns:owners': {
          'tns:name': '',
          'tns:objectID': {
            'tns:id': target.target.id,
            'tns:type': 'DMInternalDocument',
          },
        },
      },
    };

    return soap
      .executeAsync(request, { timeout: TIMEOUT })
      .then((message: DataResult<DataFiles<DocFlowFileSOAP[]>>) => {
        this.logger.info(`${DocFlowService.name}: [Request] ${soap.lastRequest}`);
        // this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);

        if (message[0]?.return) {
          return {
            object: message[0].return.files.map((file) => docFlowFile(file)),
          };
        }

        return { error: PortalError.SOAP_EMPTY_RESULT };
      })
      .catch((error: Error) => {
        this.logger.info(`docFlowGetTasks: [Request] ${soap.lastRequest}`);
        this.logger.info(`docFlowGetTasks: [Response] ${soap.lastResponse}`);
        this.logger.error(error);

        return { error: __DEV__ ? error : PortalError.SOAP_EMPTY_RESULT };
      });
  };

  docFlowTargetWithFiles = async (soap: SoapClient, target: DocFlowTarget): Promise<DocFlowTarget> => {
    // TODO: переделать на allSettled
    const files = await this.docFlowFiles(soap, target);

    return {
      ...target,
      files,
    };
  };

  docFlowTaskWithFiles = async (soap: SoapClient, task: DocFlowTask): Promise<DocFlowTask> => {
    const promiseTargets = task.targets?.map((target) => this.docFlowTargetWithFiles(soap, target));

    const targets = promiseTargets && (await Promise.all(promiseTargets));

    return {
      ...task,
      targets,
    };
  };

  docFlowTasksWithFiles = async (soap: SoapClient, tasksSOAP: DocFlowTaskSOAP[]): Promise<DocFlowTask[]> => {
    const tasksWithoutFiles = tasksSOAP.map((taskSOAP) => docFlowTask(taskSOAP));

    const tasks = tasksWithoutFiles.map((task) => this.docFlowTaskWithFiles(soap, task));

    const tasksWithFiles = await Promise.all(tasks);

    return tasksWithFiles;
  };

  /**
   * DocFlow tasks list
   *
   * @async
   * @method DocFlowTasks
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowTask[]}
   */
  docFlowTasks = async (user: User, password: string, tasks?: DocFlowTasksInput): Promise<DocFlowTask[]> => {
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

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      if (client) {
        const tasksGraphql = client
          .executeAsync(
            {
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
            },
            { timeout: TIMEOUT },
          )
          .then((message: DataResult<DataItems<DocFlowTaskSOAP[]>>) => {
            this.logger.info(`${DocFlowService.name}: [Request] ${client.lastRequest}`);
            // this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);

            if (message[0] && Array.isArray(message[0].return?.items)) {
              const tasksWithFiles = this.docFlowTasksWithFiles(client, message[0].return.items);

              return tasksWithFiles;
            }

            throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowGetTasks: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowGetTasks: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new UnprocessableEntityException();
          });

        return tasksGraphql;
      }
    }

    throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
  };

  /**
   * DocFlow tasks list (cache)
   *
   * @async
   * @method DocFlowTasksCache
   * @param {User} user User object
   * @param {string} password The Password
   * @param {task}
   * @returns {DocFlowTask[]}
   */
  docFlowTasksCache = async (user: User, password: string, tasks?: DocFlowTasksInput): Promise<DocFlowTask[]> => {
    const cachedID = `${user.id}-docflow-tasks`;
    if (this.cache && (!tasks || tasks.cache !== false)) {
      const cached: DocFlowTask[] = await this.cache.get<DocFlowTask[]>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          try {
            const ticketsTasks = await this.docFlowTasks(user, password, tasks);
            this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TASKS, {
              userId: user.id || '',
              object: ticketsTasks,
            });
            this.cache.set(cachedID, ticketsTasks, this.ttl);
          } catch (error) {
            this.logger.error('docFlowTasksCache error:', error);
          }

          // TODO: продумать сервис для обновления данных по пользователям
          // setTimeout(() => this.docFlowTasksCache(user, password, tasks), TIMEOUT_REFETCH_SERVICES);
        })();

        return cached;
      }
    }

    try {
      const ticketsTasks = await this.docFlowTasks(user, password, tasks);
      this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TASKS, { userId: user.id || '', object: ticketsTasks });

      if (this.cache) {
        this.cache.set<DocFlowTask[]>(cachedID, ticketsTasks, this.ttl);
      }

      return ticketsTasks;
    } catch (error) {
      this.logger.error('docFlowTasksCache error:', error);

      throw new InternalServerErrorException(error);
    }
  };

  /**
   * DocFlow get task
   *
   * @async
   * @method DocFlowTask
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowTask}
   */
  docFlowTask = async (user: User, password: string, task?: DocFlowTaskInput): Promise<DocFlowTask> => {
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

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      if (client) {
        return client
          .executeAsync(
            {
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
            },
            { timeout: TIMEOUT },
          )
          .then((message: DataResult<DataItems<DocFlowTaskSOAP[]>>) => {
            this.logger.info(`${DocFlowService.name}: [Request] ${client.lastRequest}`);
            // this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);

            if (message[0] && Array.isArray(message[0].return?.items)) {
              const result = message[0]?.return?.items?.map((t) => docFlowTask(t));

              return result;
            }

            throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowGetTasks: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowGetTasks: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
          });
      }
    }

    throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
  };

  /**
   * DocFlow task get (cache)
   *
   * @async
   * @method DocFlowTasksCache
   * @param {User} user User object
   * @param {string} password The Password
   * @param {task}
   * @returns {DocFlowTask}
   */
  docFlowTaskCache = async (user: User, password: string, task?: DocFlowTaskInput): Promise<DocFlowTask> => {
    const cachedID = `${user.id}-docflow-task`;
    if (this.cache && (!task || task.cache !== false)) {
      const cached: DocFlowTask = await this.cache.get<DocFlowTask>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          const ticketsTasks = await this.docFlowTask(user, password, task);
          this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TASK, {
            userId: user.id || '',
            object: ticketsTasks,
          });
          this.cache.set(cachedID, ticketsTasks, this.ttl);

          // TODO: продумать сервис для обновления данных по пользователям
          // setTimeout(() => this.docFlowTaskCache(user, password, task), TIMEOUT_REFETCH_SERVICES);
        })();

        return cached;
      }
    }

    try {
      const ticketsTask = await this.docFlowTask(user, password, task);
      this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TASK, { userId: user.id || '', object: ticketsTask });

      if (this.cache) {
        this.cache.set<DocFlowTask>(cachedID, ticketsTask, this.ttl);
      }

      return ticketsTask;
    } catch (error) {
      this.logger.error('docFlowTasksCache error:', error);

      throw new InternalServerErrorException(error);
    }
  };

  /**
   * DocFlow get current user
   *
   * @async
   * @method docFlowGetCurrentUser
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowUser}
   */
  docFlowCurrentUser = async (user: User, password: string, input?: DocFlowUserInput): Promise<DocFlowUser> => {
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

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      if (client) {
        return client
          .executeAsync(
            {
              'tns:request': {
                attributes: {
                  'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
                  'xsi:type': 'tns:DMGetCurrentUserRequest',
                },
              },
            },
            { timeout: TIMEOUT },
          )
          .then((message: DataResult<DataUser<DocFlowUserSOAP>>) => {
            this.logger.info(`${DocFlowService.name}: [Request] ${client.lastRequest}`);
            // this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);

            if (message[0]?.return?.user) {
              const result = docFlowUser(message[0].return.user);

              return result;
            }

            throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowGetTasks: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowGetTasks: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
          });
      }
    }

    throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
  };

  /**
   * DocFlow target
   *
   * @async
   * @method docFlowTarget
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowUser}
   */
  docFlowTarget = async (user: User, password: string, target?: DocFlowTargetInput): Promise<DocFlowTarget> => {
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

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      if (client) {
        return client
          .executeAsync(
            {
              'tns:request': {
                attributes: {
                  'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
                  'xsi:type': 'tns:DMGetCurrentUserRequest',
                },
              },
            },
            { timeout: TIMEOUT },
          )
          .then((message: DataResult<DataItems<DocFlowTargetsSOAP>>) => {
            this.logger.info(`${DocFlowService.name}: [Request] ${client.lastRequest}`);
            // this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);

            if (message[0]?.return?.items) {
              const result = docFlowTargets(message[0].return.items);

              return result;
            }

            throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowGetTasks: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowGetTasks: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
          });
      }
    }

    throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
  };

  /**
   * DocFlow target (cache)
   *
   * @async
   * @method DocFlowTargetCache
   * @param {User} user User object
   * @param {string} password The Password
   * @param {task}
   * @returns {DocFlowTask[]}
   */
  docFlowTargetCache = async (user: User, password: string, target?: DocFlowTargetInput): Promise<DocFlowTarget> => {
    const cachedID = `${user.id}-docflow-target`;
    if (this.cache && (!target || target.cache !== false)) {
      const cached: DocFlowTarget = await this.cache.get<DocFlowTarget>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          try {
            const ticketsTarget = await this.docFlowTarget(user, password, target);
            this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TARGET, {
              userId: user.id || '',
              object: ticketsTarget,
            });
            this.cache.set(cachedID, ticketsTarget, this.ttl);
          } catch (error) {
            this.logger.error('docFlowTasksCache error:', error);
          }

          // TODO: продумать сервис для обновления данных по пользователям
          // setTimeout(() => this.docFlowTargetCache(user, password, target), TIMEOUT_REFETCH_SERVICES);
        })();

        return cached;
      }
    }

    try {
      const ticketsTarget = await this.docFlowTarget(user, password, target);
      this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TARGET, { userId: user.id || '', object: ticketsTarget });

      if (this.cache) {
        this.cache.set<DocFlowTarget>(cachedID, ticketsTarget, this.ttl);
      }

      return ticketsTarget;
    } catch (error) {
      this.logger.error('docFlowTargetCache error:', error);

      throw new InternalServerErrorException(error);
    }
  };

  /**
   * DocFlow get file list
   *
   * @async
   * @method docFlowFileList
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowFile}
   */
  docFlowFileList = async (user: User, password: string, file: DocFlowFileInput): Promise<DocFlowFile[]> => {
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

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      if (client) {
        return client
          .executeAsync(
            {
              'tns:request': {
                'attributes': {
                  'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
                  'xsi:type': 'tns:DMGetFileListByOwnerRequest',
                },
                'tns:dataBaseID': '',
                'tns:owners': {
                  'name': '',
                  'tns:objectID': {
                    id: '',
                    type: 'DMInternalDocument',
                  },
                },
                'columnSet': 'objectId',
                // <m:columnSet>signed</m:columnSet>
                // <m:columnSet>name</m:columnSet>
                // <m:columnSet>size</m:columnSet>
                // <m:columnSet>creationDate</m:columnSet>
                // <m:columnSet>modificationDateUniversal</m:columnSet>
                // <m:columnSet>author</m:columnSet>
                // <m:columnSet>extension</m:columnSet>
                // <m:columnSet>description</m:columnSet>
                // <m:columnSet>encrypted</m:columnSet>
                // <m:columnSet>editing</m:columnSet>
                // <m:columnSet>editingUser</m:columnSet>
              },
            },
            { timeout: TIMEOUT },
          )
          .then((message: DataResult<DataItems<DocFlowTaskSOAP[]>>) => {
            this.logger.info(`${DocFlowService.name}: [Request] ${client.lastRequest}`);
            // this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);

            if (message[0] && Array.isArray(message[0].return?.items)) {
              const result = message[0]?.return?.items?.map((t) => docFlowTask(t));

              return result;
            }

            throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowGetTasks: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowGetTasks: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
          });
      }
    }

    throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
  };

  /**
   * DocFlow get file by version
   *
   * @async
   * @method docFlowFile
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowFile}
   */
  docFlowFile = async (user: User, password: string, file: DocFlowFileInput): Promise<DocFlowFile> => {
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

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      if (client) {
        return client
          .executeAsync(
            {
              'tns:request': {
                'attributes': {
                  'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
                  'xsi:type': 'tns:DMGetFileListByOwnerRequest',
                },
                'tns:dataBaseID': '',
                'tns:owners': {
                  'name': '',
                  'tns:objectID': {
                    id: '',
                    type: 'DMInternalDocument',
                  },
                },
                'columnSet': 'objectId',
                // <m:columnSet>signed</m:columnSet>
                // <m:columnSet>name</m:columnSet>
                // <m:columnSet>size</m:columnSet>
                // <m:columnSet>creationDate</m:columnSet>
                // <m:columnSet>modificationDateUniversal</m:columnSet>
                // <m:columnSet>author</m:columnSet>
                // <m:columnSet>extension</m:columnSet>
                // <m:columnSet>description</m:columnSet>
                // <m:columnSet>encrypted</m:columnSet>
                // <m:columnSet>editing</m:columnSet>
                // <m:columnSet>editingUser</m:columnSet>
              },
            },
            { timeout: TIMEOUT },
          )
          .then((message: DataResult<DataItems<DocFlowTaskSOAP[]>>) => {
            this.logger.info(`${DocFlowService.name}: [Request] ${client.lastRequest}`);
            // this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);

            if (message[0] && Array.isArray(message[0].return?.items)) {
              const result = message[0].return.items.map((t) => docFlowTask(t));

              return result;
            }

            throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowGetTasks: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowGetTasks: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
          });
      }
    }

    throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
  };
}
