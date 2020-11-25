/** @format */

//#region Imports NPM
import {
  Inject,
  Injectable,
  ForbiddenException,
  UnprocessableEntityException,
  NotImplementedException,
  NotFoundException,
  GatewayTimeoutException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import CacheManager from 'cache-manager';
import RedisStore from 'cache-manager-ioredis';
import { RedisService } from 'nest-redis';
import type { LoggerContext } from 'nestjs-ldap';
import { OperationCanceledException } from 'typescript';
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
  DocFlowInternalFile,
  DocFlowInternalDocument,
  DocFlowInternalDocumentInput,
} from '@lib/types/docflow';
import type {
  SubscriptionPayload,
  DocFlowTaskSOAP,
  DocFlowUserSOAP,
  DocFlowTargetSOAP,
  DocFlowFileSOAP,
  DocFlowInternalDocumentSOAP,
} from '@back/shared/types';
import { constructUploads } from '@back/shared/upload';
import { PortalError } from '@back/shared/errors';
import type { DataResult, DataObjects, DataObject, DataFiles, DataItems, DataUser, DataError } from '@lib/types/common';
import { docFlowTask, docFlowUser, docFlowFile, docFlowError, docFlowData, docFlowInternalDocument } from './docflow.utils';
//#endregion

// создается микросервис, который будет обновлять данные кэша из документооборота
// пока так... но дальше...

/**
 * Tickets class
 * @class
 */
@Injectable()
export class DocFlowService {
  private ttl: number;
  private cache?: ReturnType<typeof CacheManager.caching>;

  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
    private readonly configService: ConfigService,
    private readonly soapService: SoapService,
    private readonly redisService: RedisService,
  ) {
    this.ttl = configService.get<number>('DOCFLOW_REDIS_TTL') || 900;
    const redisInstance = this.redisService.getClient('DOCFLOW');
    if (redisInstance) {
      this.cache = CacheManager.caching({
        store: RedisStore,
        redisInstance,
        ttl: this.ttl,
      });

      if (this.cache.store) {
        logger.debug!({ message: 'Redis connection: success', context: DocFlowService.name, function: 'constructor' });
      } else {
        logger.error({ message: 'Redis connection: not connected', context: DocFlowService.name, function: 'constructor' });
      }
    }
  }

  docFlowFiles = async ({
    soap,
    target,
    loggerContext,
  }: {
    soap: SoapClient;
    target: DocFlowTarget;
    loggerContext?: LoggerContext;
  }): Promise<DocFlowFiles> => {
    const requestSOAP = {
      'tns:request': {
        attributes: {
          'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
          'xsi:type': 'tns:DMGetFileListByOwnerRequest',
        },
        $xml:
          '<tns:dataBaseID></tns:dataBaseID>' +
          '<tns:owners>' +
          '<tns:name />' +
          '<tns:objectID>' +
          `<tns:id>${target.target.id}</tns:id>` +
          '<tns:type>DMInternalDocument</tns:type>' +
          '</tns:objectID>' +
          '</tns:owners>' +
          '<tns:columnSet>objectId</tns:columnSet>' +
          '<tns:columnSet>name</tns:columnSet>' +
          '<tns:columnSet>author</tns:columnSet>' +
          '<tns:columnSet>extension</tns:columnSet>' +
          '<tns:columnSet>size</tns:columnSet>' +
          '<tns:columnSet>creationDate</tns:columnSet>' +
          '<tns:columnSet>modificationDateUniversal</tns:columnSet>' +
          '<tns:columnSet>encrypted</tns:columnSet>' +
          '<tns:columnSet>description</tns:columnSet>' +
          '<tns:columnSet>signed</tns:columnSet>' +
          '<tns:columnSet>editing</tns:columnSet>' +
          '<tns:columnSet>editingUser</tns:columnSet>',
      },
    };

    return soap
      .executeAsync(requestSOAP, { timeout: TIMEOUT })
      .then((message: DataResult<DataFiles<DocFlowFileSOAP>> | DataResult<DataError>) => {
        if (docFlowData<DataFiles>(message[0]?.return)) {
          this.logger.debug!({
            message: `docFlowFiles: [Request] ${soap.lastRequest}`,
            context: DocFlowService.name,
            function: 'docFlowFiles',
            ...loggerContext,
          });
          // this.logger.debug(`docFlowFiles: [Response] ${client.lastResponse}`, { context:DocFlowService.name, function:'docFlowFiles' });

          if (message[0]?.return) {
            return {
              object: message[0].return.files.map((file) => docFlowFile(file)),
            };
          }

          return { error: [PortalError.SOAP_EMPTY_RESULT] };
        }

        throw new ForbiddenException(docFlowError(message[0]?.return));
      })
      .catch((error: Error | ForbiddenException) => {
        this.logger.error({
          message: `docFlowFiles: [Request] ${soap.lastRequest}`,
          context: DocFlowService.name,
          function: 'docFlowFiles',
          ...loggerContext,
        });
        this.logger.error({
          message: `docFlowFiles: [Response] ${soap.lastResponse}`,
          context: DocFlowService.name,
          function: 'docFlowFiles',
          ...loggerContext,
        });
        this.logger.error({
          message: `docFlowFiles: ${error.toString()}`,
          error,
          context: DocFlowService.name,
          function: 'docFlowFiles',
          ...loggerContext,
        });

        if (error instanceof Error && (error as any)?.code === 'TIMEOUT') {
          throw new GatewayTimeoutException(__DEV__ ? error : undefined);
        }

        if (error instanceof ForbiddenException) {
          return { error: [error] };
        }

        return { error: [__DEV__ ? error : PortalError.SOAP_EMPTY_RESULT] };
      });
  };

  docFlowTargetWithFiles = async ({
    soap,
    target,
    loggerContext,
  }: {
    soap: SoapClient;
    target: DocFlowTarget;
    loggerContext?: LoggerContext;
  }): Promise<DocFlowTarget> => {
    // TODO: переделать на allSettled
    const files = await this.docFlowFiles({ soap, target, loggerContext });

    return {
      ...target,
      target: {
        ...target.target,
        files,
      },
    };
  };

  docFlowTaskWithFiles = async ({
    soap,
    task,
    loggerContext,
  }: {
    soap: SoapClient;
    task: DocFlowTask;
    loggerContext?: LoggerContext;
  }): Promise<DocFlowTask> => {
    const promiseTargets = task.targets?.map((target) => this.docFlowTargetWithFiles({ soap, target, loggerContext }));

    const targets = promiseTargets ? await Promise.all(promiseTargets) : null;

    return {
      ...task,
      targets,
    };
  };

  docFlowTasksWithFiles = async ({
    soap,
    tasksSOAP,
    loggerContext,
  }: {
    soap: SoapClient;
    tasksSOAP: DataObject<DocFlowTaskSOAP>[];
    loggerContext?: LoggerContext;
  }): Promise<DocFlowTask[]> => {
    const tasksWithoutFiles = tasksSOAP.map((taskSOAP) => docFlowTask(taskSOAP.object));

    const tasks = tasksWithoutFiles.map((task) => this.docFlowTaskWithFiles({ soap, task, loggerContext }));

    return Promise.all(tasks);
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
  docFlowTasks = async ({
    user,
    password,
    tasks,
    loggerContext,
  }: {
    user: User;
    password: string;
    tasks?: DocFlowTasksInput;
    loggerContext?: LoggerContext;
  }): Promise<DocFlowTask[]> => {
    const soapUrl = this.configService.get<string>('DOCFLOW_URL');
    if (soapUrl) {
      const client = await this.soapService
        .connect(
          {
            url: soapUrl,
            username: user.username || 'not authenticated',
            password,
            domain: user.loginDomain,
            ntlm: true,
            soapOptions: {
              namespaceArrayElements: false,
            },
          },
          loggerContext,
        )
        .catch((error: Error) => {
          this.logger.error({
            message: `docFlowTasks: ${error.toString()}`,
            error,
            context: DocFlowService.name,
            function: 'docFlowTasks',
            ...loggerContext,
          });

          if (error instanceof Error && (error as any)?.code === 'TIMEOUT') {
            throw new GatewayTimeoutException(__DEV__ ? error : undefined);
          }

          throw new ForbiddenException(PortalError.SOAP_NOT_AUTHORIZED);
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
          .then((message: DataResult<DataItems<DataObject<DocFlowTaskSOAP>>> | DataResult<DataError>) => {
            if (docFlowData<DataItems>(message[0]?.return)) {
              if (message[0] && Array.isArray(message[0].return?.items)) {
                this.logger.debug!({
                  message: `docFlowTasks: [Request] ${client.lastRequest}`,
                  context: DocFlowService.name,
                  function: 'docFlowTasks',
                  ...loggerContext,
                });
                // this.logger.debug(`docFlowTasks: [Response] ${client.lastResponse}`, { context: DocFlowService.name });

                return this.docFlowTasksWithFiles({ soap: client, tasksSOAP: message[0].return.items, loggerContext });
              }

              throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
            }

            throw new ForbiddenException(docFlowError(message[0]?.return));
          })
          .catch((error: Error | ForbiddenException | OperationCanceledException) => {
            this.logger.error!({
              message: `docFlowTasks: [Request] ${client.lastRequest}`,
              context: DocFlowService.name,
              function: 'docFlowTasks',
              ...loggerContext,
            });
            this.logger.error({
              message: `docFlowTasks: [Response] ${client.lastResponse}`,
              context: DocFlowService.name,
              function: 'docFlowTasks',
              ...loggerContext,
            });
            this.logger.error({
              message: `docFlowTasks: ${error.toString()}`,
              error,
              context: DocFlowService.name,
              function: 'docFlowTasks',
              ...loggerContext,
            });

            if (error instanceof Error && (error as any)?.code === 'TIMEOUT') {
              throw new GatewayTimeoutException(__DEV__ ? error : undefined);
            } else if (error instanceof ForbiddenException) {
              throw error;
            } else if (error instanceof OperationCanceledException) {
              throw error;
            }

            throw new UnprocessableEntityException(__DEV__ ? error : undefined);
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
  docFlowTasksCache = async ({
    user,
    password,
    tasks,
    loggerContext,
  }: {
    user: User;
    password: string;
    tasks?: DocFlowTasksInput;
    loggerContext?: LoggerContext;
  }): Promise<DocFlowTask[]> => {
    const userId = user.id || '';
    const cachedId = `tasks:${userId}`;
    if (this.cache && (!tasks || tasks.cache !== false)) {
      const cached: DocFlowTask[] = await this.cache.get<DocFlowTask[]>(cachedId);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          try {
            const ticketsTasks = await this.docFlowTasks({ user, password, tasks, loggerContext });

            if (JSON.stringify(ticketsTasks) !== JSON.stringify(cached)) {
              this.pubSub.publish<SubscriptionPayload<DocFlowTask[]>>(PortalPubSub.DOCFLOW_TASKS, {
                userId,
                object: ticketsTasks,
              });
              if (this.cache) {
                this.cache.set<DocFlowTask[]>(cachedId, ticketsTasks, { ttl: this.ttl });
              }
            }
          } catch (error) {
            this.logger.error({
              message: `docFlowTasksCache: ${error.toString()}`,
              error,
              context: DocFlowService.name,
              function: 'docFlowTasksCache',
              ...loggerContext,
            });
          }
        })();

        return cached;
      }
    }

    try {
      const ticketsTasks = await this.docFlowTasks({ user, password, tasks, loggerContext });

      if (this.cache) {
        this.cache.set<DocFlowTask[]>(cachedId, ticketsTasks, { ttl: this.ttl });
      }

      return ticketsTasks;
    } catch (error) {
      this.logger.error({
        message: `docFlowTasksCache: ${error.toString()}`,
        error,
        context: DocFlowService.name,
        function: 'docFlowTasksCache',
        ...loggerContext,
      });

      throw error;
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
  docFlowTask = async ({
    user,
    password,
    task,
    loggerContext,
  }: {
    user: User;
    password: string;
    task: DocFlowTaskInput;
    loggerContext?: LoggerContext;
  }): Promise<DocFlowTask> => {
    const soapUrl = this.configService.get<string>('DOCFLOW_URL');
    if (soapUrl) {
      const client = await this.soapService
        .connect(
          {
            url: soapUrl,
            username: user.username || 'not authenticated',
            password,
            domain: user.loginDomain,
            ntlm: true,
            soapOptions: {
              namespaceArrayElements: false,
            },
          },
          loggerContext,
        )
        .catch((error: Error) => {
          this.logger.error({
            message: `docFlowTask: ${error.toString()}`,
            error,
            context: DocFlowService.name,
            function: 'docFlowTask',
            ...loggerContext,
          });

          throw new ForbiddenException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      if (client) {
        return client
          .executeAsync(
            {
              'tns:request': {
                'attributes': {
                  'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
                  'xsi:type': 'tns:DMRetrieveRequest',
                },
                'tns:dataBaseID': '',
                'tns:objectIds': {
                  'tns:id': task.id,
                  'tns:type': 'DMBusinessProcessTask',
                },
                'tns:columnSet': 'withDependentObjects',
              },
            },
            { timeout: TIMEOUT },
          )
          .then((message: DataResult<DataObjects<DocFlowTaskSOAP>> | DataResult<DataError>) => {
            if (docFlowData<DataObjects>(message[0]?.return)) {
              if (message[0]?.return?.objects && Array.isArray(message[0].return.objects) && message[0].return.objects.length > 0) {
                const tasks = message[0].return.objects.map((t) => docFlowTask(t));

                if (Array.isArray(tasks) && tasks.length > 0) {
                  if (tasks.length > 1) {
                    this.logger.verbose!({
                      message: 'docFlowTask: result.length > 1 ??',
                      context: DocFlowService.name,
                      function: 'docFlowTask',
                      ...loggerContext,
                    });
                  }
                  const taskWithoutFiles = tasks.pop();
                  if (taskWithoutFiles) {
                    this.logger.debug!({
                      message: `docFlowTask: [Request] ${client.lastRequest}`,
                      context: DocFlowService.name,
                      function: 'docFlowTask',
                      ...loggerContext,
                    });
                    // this.logger.debug(`${DocFlowService.name}: [Response] ${client.lastResponse}`,
                    // { context: DocFlowService.name, function: 'docFlowTask' });

                    const result = this.docFlowTaskWithFiles({ soap: client, task: taskWithoutFiles, loggerContext });
                    return result;
                  }
                }
              }

              throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
            }

            throw new ForbiddenException(docFlowError(message[0]?.return));
          })
          .catch((error: Error | ForbiddenException | NotFoundException) => {
            this.logger.error({
              message: `docFlowTask: [Request] ${client.lastRequest}`,
              context: DocFlowService.name,
              function: 'docFlowTask',
              ...loggerContext,
            });
            this.logger.error({
              message: `docFlowTask: [Response] ${client.lastResponse}`,
              context: DocFlowService.name,
              function: 'docFlowTask',
              ...loggerContext,
            });
            this.logger.error({
              message: `docFlowTask: ${error.toString()}`,
              error,
              context: DocFlowService.name,
              function: 'docFlowTask',
              ...loggerContext,
            });

            if (error instanceof Error && (error as any)?.code === 'TIMEOUT') {
              throw new GatewayTimeoutException(__DEV__ ? error : undefined);
            } else if (error instanceof ForbiddenException) {
              throw error;
            }

            throw new UnprocessableEntityException(__DEV__ ? error : undefined);
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
  docFlowTaskCache = async ({
    user,
    password,
    task,
    loggerContext,
  }: {
    user: User;
    password: string;
    task: DocFlowTaskInput;
    loggerContext?: LoggerContext;
  }): Promise<DocFlowTask> => {
    const userId = user.id || '';
    const cachedId = `task:${task.id}`;
    if (this.cache && (!task || task.cache !== false)) {
      const cached: DocFlowTask = await this.cache.get<DocFlowTask>(cachedId);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          try {
            const ticketsTask = await this.docFlowTask({ user, password, task, loggerContext });

            if (JSON.stringify(ticketsTask) !== JSON.stringify(cached)) {
              this.pubSub.publish<SubscriptionPayload<DocFlowTask>>(PortalPubSub.DOCFLOW_TASK, {
                userId,
                object: ticketsTask,
              });
              if (this.cache) {
                this.cache.set<DocFlowTask>(cachedId, ticketsTask, { ttl: this.ttl });
              }
            }
          } catch (error) {
            this.logger.error({
              message: `docFlowTaskCache: ${error.toString()}`,
              error,
              context: DocFlowService.name,
              function: 'docFlowTaskCache',
              ...loggerContext,
            });
          }
        })();

        return cached;
      }
    }

    try {
      const ticketsTask = await this.docFlowTask({ user, password, task, loggerContext });

      if (this.cache) {
        this.cache.set<DocFlowTask>(cachedId, ticketsTask, { ttl: this.ttl });
      }

      return ticketsTask;
    } catch (error) {
      this.logger.error({
        message: `docFlowTaskCache: ${error.toString()}`,
        error,
        context: DocFlowService.name,
        function: 'docFlowTaskCache',
        ...loggerContext,
      });

      throw error;
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
  docFlowCurrentUser = async ({
    user,
    password,
    input,
    loggerContext,
  }: {
    user: User;
    password: string;
    input?: DocFlowUserInput;
    loggerContext?: LoggerContext;
  }): Promise<DocFlowUser> => {
    const soapUrl = this.configService.get<string>('DOCFLOW_URL');
    if (soapUrl) {
      const client = await this.soapService
        .connect(
          {
            url: soapUrl,
            username: user.username || 'not authenticated',
            password,
            domain: user.loginDomain,
            ntlm: true,
            soapOptions: {
              namespaceArrayElements: false,
            },
          },
          loggerContext,
        )
        .catch((error: Error) => {
          this.logger.error({
            message: `docFlowCurrentUser: ${error.toString()}`,
            error,
            context: DocFlowService.name,
            function: 'docFlowCurrentUser',
            ...loggerContext,
          });

          throw new ForbiddenException(PortalError.SOAP_NOT_AUTHORIZED);
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
          .then((message: DataResult<DataUser<DocFlowUserSOAP>> | DataResult<DataError>) => {
            if (docFlowData<DataUser>(message[0]?.return)) {
              this.logger.debug!({
                message: `docFlowCurrentUser: [Request] ${client.lastRequest}`,
                context: DocFlowService.name,
                function: 'docFlowCurrentUser',
                ...loggerContext,
              });
              // this.logger.debug(`docFlowCurrentUser: [Response] ${client.lastResponse}`, { context: DocFlowService.name });

              if (message[0]?.return?.user) {
                return docFlowUser(message[0].return.user);
              }

              throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
            }

            throw new ForbiddenException(docFlowError(message[0]?.return));
          })
          .catch((error: Error | ForbiddenException | NotFoundException) => {
            this.logger.error({
              message: `docFlowCurrentUser: [Request] ${client.lastRequest}`,
              context: DocFlowService.name,
              function: 'docFlowCurrentUser',
              ...loggerContext,
            });
            this.logger.error({
              message: `docFlowCurrentUser: [Response] ${client.lastResponse}`,
              context: DocFlowService.name,
              function: 'docFlowCurrentUser',
              ...loggerContext,
            });
            this.logger.error({
              message: `docFlowCurrentUser: ${error.toString()}`,
              error,
              context: DocFlowService.name,
              function: 'docFlowCurrentUser',
              ...loggerContext,
            });

            if (error instanceof Error && (error as any)?.code === 'TIMEOUT') {
              throw new GatewayTimeoutException(__DEV__ ? error : undefined);
            } else if (error instanceof ForbiddenException) {
              throw error;
            }

            throw new UnprocessableEntityException(__DEV__ ? error : undefined);
          });
      }
    }

    throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
  };

  /**
   * DocFlow target
   *
   * @async
   * @method docFlowInternalDocument
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowInternalDocument}
   */
  docFlowInternalDocument = async ({
    user,
    password,
    internalDocument,
    loggerContext,
  }: {
    user: User;
    password: string;
    internalDocument: DocFlowInternalDocumentInput;
    loggerContext?: LoggerContext;
  }): Promise<DocFlowInternalDocument> => {
    const soapUrl = this.configService.get<string>('DOCFLOW_URL');
    if (soapUrl) {
      const client = await this.soapService
        .connect(
          {
            url: soapUrl,
            username: user.username || 'not authenticated',
            password,
            domain: user.loginDomain,
            ntlm: true,
            soapOptions: {
              namespaceArrayElements: false,
            },
          },
          loggerContext,
        )
        .catch((error: Error) => {
          this.logger.error({
            message: `docFlowInternalDocument: ${error.toString()}`,
            error,
            context: DocFlowService.name,
            function: 'docFlowInternalDocument',
            ...loggerContext,
          });

          throw new ForbiddenException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      if (client) {
        return client
          .executeAsync(
            {
              'tns:request': {
                'attributes': {
                  'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
                  'xsi:type': 'tns:DMRetrieveRequest',
                },
                'tns:dataBaseID': '',
                'tns:objectIds': {
                  'tns:id': internalDocument.id,
                  'tns:type': 'DMInternalDocument',
                },
              },
            },
            { timeout: TIMEOUT },
          )
          .then((message: DataResult<DataObjects<DocFlowInternalDocumentSOAP>> | DataResult<DataError>) => {
            if (docFlowData<DataObjects>(message[0]?.return)) {
              if (message[0]?.return?.objects && Array.isArray(message[0].return.objects) && message[0].return.objects.length > 0) {
                this.logger.debug!({
                  message: `docFlowInternalDocument: [Request] ${client.lastRequest}`,
                  context: DocFlowService.name,
                  function: 'docFlowInternalDocument',
                  ...loggerContext,
                });
                // this.logger.debug(`docFlowInternalDocument: [Response] ${client.lastResponse}`,
                // { context: DocFlowService.name, function: 'docFlowInternalDocument' });

                return message[0].return.objects.map((t) => docFlowInternalDocument(t));
              }

              throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
            }

            throw new ForbiddenException(docFlowError(message[0]?.return));
          })
          .catch((error: Error | ForbiddenException | NotFoundException) => {
            this.logger.error({
              message: `docFlowInternalDocument: [Request] ${client.lastRequest}`,
              context: DocFlowService.name,
              function: 'docFlowInternalDocument',
              ...loggerContext,
            });
            this.logger.error({
              message: `docFlowInternalDocument: [Response] ${client.lastResponse}`,
              context: DocFlowService.name,
              function: 'docFlowInternalDocument',
              ...loggerContext,
            });
            this.logger.error({
              message: `docFlowInternalDocument: ${error.toString()}`,
              error,
              context: DocFlowService.name,
              function: 'docFlowInternalDocument',
              ...loggerContext,
            });

            if (error instanceof Error && (error as any)?.code === 'TIMEOUT') {
              throw new GatewayTimeoutException(__DEV__ ? error : undefined);
            } else if (error instanceof ForbiddenException) {
              throw error;
            }

            throw new UnprocessableEntityException(__DEV__ ? error : undefined);
          });
      }
    }

    throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
  };

  /**
   * DocFlow target (cache)
   *
   * @async
   * @method docFlowInternalDocumentCache
   * @param {User} user User object
   * @param {string} password The Password
   * @param {task}
   * @returns {DocFlowInternalDocument}
   */
  docFlowInternalDocumentCache = async ({
    user,
    password,
    internalDocument,
    loggerContext,
  }: {
    user: User;
    password: string;
    internalDocument: DocFlowInternalDocumentInput;
    loggerContext?: LoggerContext;
  }): Promise<DocFlowInternalDocument> => {
    const userId = user.id || '';
    const cachedId = `internalDocument:${internalDocument.id}`;
    if (this.cache && (!internalDocument || internalDocument.cache !== false)) {
      const cached: DocFlowInternalDocument = await this.cache.get<DocFlowInternalDocument>(cachedId);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          try {
            const internalDocumentCache = await this.docFlowInternalDocument({ user, password, internalDocument, loggerContext });

            if (JSON.stringify(internalDocumentCache) !== JSON.stringify(cached)) {
              this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_INTERNAL_DOCUMENT, {
                userId,
                object: internalDocumentCache,
              });
              if (this.cache) {
                this.cache.set<DocFlowInternalDocument>(cachedId, internalDocumentCache, { ttl: this.ttl });
              }
            } else {
              setTimeout(
                () => this.docFlowInternalDocumentCache({ user, password, internalDocument, loggerContext }),
                TIMEOUT_REFETCH_SERVICES,
              );
            }
          } catch (error) {
            this.logger.error({
              message: `docFlowInternalDocumentCache: ${error.toString()}`,
              error,
              function: 'docFlowInternalDocumentCache',
              context: DocFlowService.name,
              ...loggerContext,
            });
          }
        })();

        return cached;
      }
    }

    try {
      const internalDocumentCache = await this.docFlowInternalDocument({ user, password, internalDocument, loggerContext });

      if (this.cache) {
        this.cache.set<DocFlowInternalDocument>(cachedId, internalDocumentCache, { ttl: this.ttl });
      }

      return internalDocumentCache;
    } catch (error) {
      this.logger.error({
        message: `docFlowInternalDocumentCache: ${error.toString()}`,
        error,
        context: DocFlowService.name,
        function: 'docFlowInternalDocumentCache',
        ...loggerContext,
      });

      throw error;
    }
  };

  /**
   * DocFlow get file
   *
   * @async
   * @method docFlowFile
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {DocFlowFile}
   */
  docFlowFile = async ({
    user,
    password,
    file,
    loggerContext,
  }: {
    user: User;
    password: string;
    file: DocFlowFileInput;
    loggerContext?: LoggerContext;
  }): Promise<DocFlowFile> => {
    const soapUrl = this.configService.get<string>('DOCFLOW_URL');
    if (soapUrl) {
      const client = await this.soapService
        .connect(
          {
            url: soapUrl,
            username: user.username || 'not authenticated',
            password,
            domain: user.loginDomain,
            ntlm: true,
            soapOptions: {
              namespaceArrayElements: false,
            },
          },
          loggerContext,
        )
        .catch((error: Error) => {
          this.logger.error({
            message: `docFlowFile: ${error.toString()}`,
            error,
            context: DocFlowService.name,
            function: 'docFlowFile',
            ...loggerContext,
          });

          throw new ForbiddenException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      if (client) {
        return client
          .executeAsync(
            {
              'tns:request': {
                attributes: {
                  'xmlns:xs': 'http://www.w3.org/2001/XMLSchema',
                  'xsi:type': 'tns:DMRetrieveRequest',
                },
                $xml:
                  '<tns:dataBaseID></tns:dataBaseID>' +
                  '<tns:objectIds>' +
                  `<tns:id>${file.id}</tns:id>` +
                  '<tns:type>DMFile</tns:type>' +
                  '</tns:objectIds>' +
                  '<tns:columnSet>objectId</tns:columnSet>' +
                  '<tns:columnSet>name</tns:columnSet>' +
                  '<tns:columnSet>description</tns:columnSet>' +
                  '<tns:columnSet>author</tns:columnSet>' +
                  '<tns:columnSet>encrypted</tns:columnSet>' +
                  '<tns:columnSet>signed</tns:columnSet>' +
                  '<tns:columnSet>editing</tns:columnSet>' +
                  '<tns:columnSet>editingUser</tns:columnSet>' +
                  '<tns:columnSet>binaryData</tns:columnSet>' +
                  '<tns:columnSet>extension</tns:columnSet>' +
                  '<tns:columnSet>size</tns:columnSet>' +
                  '<tns:columnSet>creationDate</tns:columnSet>' +
                  '<tns:columnSet>modificationDateUniversal</tns:columnSet>',
              },
            },
            { timeout: TIMEOUT },
          )
          .then((message: DataResult<DataObjects<DocFlowFileSOAP>> | DataResult<DataError>) => {
            if (docFlowData<DataObjects>(message[0]?.return)) {
              if (message[0] && Array.isArray(message[0].return?.objects)) {
                this.logger.debug!({
                  message: `docFlowFile: [Request] ${client.lastRequest}`,
                  context: DocFlowService.name,
                  function: 'docFlowFile',
                  ...loggerContext,
                });
                // this.logger.debug(`${DocFlowService.name}: [Response] ${client.lastResponse}`,
                // { context: DocFlowService.name, function: 'docFlowFile' });

                const result = message[0].return.objects.map((f) => docFlowFile(f));

                if (Array.isArray(result) && result.length > 1) {
                  this.logger.verbose!({
                    message: 'docFlowFile: result.length > 1 ? Something wrong...',
                    context: DocFlowService.name,
                    function: 'docFlowFile',
                    ...loggerContext,
                  });
                }

                return result.pop();
              }

              throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
            }

            throw new ForbiddenException(docFlowError(message[0]?.return));
          })
          .catch((error: Error | ForbiddenException | NotFoundException) => {
            this.logger.error({
              message: `docFlowFile: [Request] ${client.lastRequest}`,
              context: DocFlowService.name,
              function: 'docFlowFile',
              ...loggerContext,
            });
            this.logger.error({
              message: `docFlowFile: [Response] ${client.lastResponse}`,
              context: DocFlowService.name,
              function: 'docFlowFile',
              ...loggerContext,
            });
            this.logger.error({
              message: `docFlowFile: ${error.toString()}`,
              error,
              context: DocFlowService.name,
              function: 'docFlowFile',
              ...loggerContext,
            });

            if (error instanceof Error && (error as any)?.code === 'TIMEOUT') {
              throw new GatewayTimeoutException(__DEV__ ? error : undefined);
            } else if (error instanceof ForbiddenException) {
              throw error;
            }

            throw new UnprocessableEntityException(__DEV__ ? error : undefined);
          });
      }
    }

    throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
  };
}
