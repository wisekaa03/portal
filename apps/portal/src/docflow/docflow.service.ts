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
import deepEqual from 'deep-equal';
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
  DocFlowInternalFile,
} from '@lib/types/docflow';
import type { SubscriptionPayload, DocFlowTaskSOAP, DocFlowUserSOAP, DocFlowTargetsSOAP, DocFlowFileSOAP } from '@back/shared/types';
import { constructUploads } from '@back/shared/upload';
import { PortalError } from '@back/shared/errors';
import type { DataResult, DataObjects, DataObject, DataFiles, DataItems, DataUser } from '@lib/types/common';
import * as request from 'supertest';
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
        prefix: 'DOCFLOW:',
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
      .then((message: DataResult<DataFiles<DocFlowFileSOAP>>) => {
        this.logger.info(`docFlowFiles: [Request] ${soap.lastRequest}`);
        // this.logger.info(`docFlowFiles: [Response] ${client.lastResponse}`);

        if (message[0]?.return) {
          return {
            object: message[0].return.files.map((file) => docFlowFile(file)),
          };
        }

        return { error: PortalError.SOAP_EMPTY_RESULT };
      })
      .catch((error: Error) => {
        this.logger.info(`docFlowFiles: [Request] ${soap.lastRequest}`);
        this.logger.info(`docFlowFiles: [Response] ${soap.lastResponse}`);
        this.logger.error(error);

        return { error: __DEV__ ? error : PortalError.SOAP_EMPTY_RESULT };
      });
  };

  docFlowTargetWithFiles = async (soap: SoapClient, target: DocFlowTarget): Promise<DocFlowTarget> => {
    // TODO: переделать на allSettled
    const files = await this.docFlowFiles(soap, target);

    return {
      ...target,
      target: {
        ...target.target,
        files,
      },
    };
  };

  docFlowTaskWithFiles = async (soap: SoapClient, task: DocFlowTask): Promise<DocFlowTask> => {
    const promiseTargets = task.targets?.map((target) => this.docFlowTargetWithFiles(soap, target));

    const targets = promiseTargets ? await Promise.all(promiseTargets) : null;

    return {
      ...task,
      targets,
    };
  };

  docFlowTasksWithFiles = async (soap: SoapClient, tasksSOAP: DataObject<DocFlowTaskSOAP>[]): Promise<DocFlowTask[]> => {
    const tasksWithoutFiles = tasksSOAP.map((taskSOAP) => docFlowTask(taskSOAP.object));

    const tasks = tasksWithoutFiles.map((task) => this.docFlowTaskWithFiles(soap, task));

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
          .then((message: DataResult<DataItems<DataObject<DocFlowTaskSOAP>>>) => {
            this.logger.info(`docFlowTasks: [Request] ${client.lastRequest}`);
            // this.logger.info(`docFlowTasks: [Response] ${client.lastResponse}`);

            if (message[0] && Array.isArray(message[0].return?.items)) {
              return this.docFlowTasksWithFiles(client, message[0].return.items);
            }

            throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowTasks: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowTasks: [Response] ${client.lastResponse}`);
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
    const cachedID = `tasks:${user.id}`;
    if (this.cache && (!tasks || tasks.cache !== false)) {
      const cached: DocFlowTask[] = await this.cache.get<DocFlowTask[]>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          try {
            const ticketsTasks = await this.docFlowTasks(user, password, tasks);

            if (!deepEqual(ticketsTasks, cached, { strict: true })) {
              this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TASKS, {
                userId: user.id || '',
                object: ticketsTasks,
              });
              this.cache.set<DocFlowTask[]>(cachedID, ticketsTasks, { ttl: this.ttl });
            } else {
              setTimeout(() => this.docFlowTasksCache(user, password, tasks), TIMEOUT_REFETCH_SERVICES);
            }
          } catch (error) {
            this.logger.error('docFlowTasksCache error:', error);
          }
        })();

        return cached;
      }
    }

    try {
      const ticketsTasks = await this.docFlowTasks(user, password, tasks);
      this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TASKS, { userId: user.id || '', object: ticketsTasks });

      if (this.cache) {
        this.cache.set<DocFlowTask[]>(cachedID, ticketsTasks, { ttl: this.ttl });
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
  docFlowTask = async (user: User, password: string, task: DocFlowTaskInput): Promise<DocFlowTask> => {
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
          .then((message: DataResult<DataObjects<DocFlowTaskSOAP>>) => {
            this.logger.info(`docFlowTask: [Request] ${client.lastRequest}`);
            // this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);

            if (message[0] && Array.isArray(message[0].return?.objects)) {
              const tasks = message[0].return.objects.map((t) => docFlowTask(t));

              if (Array.isArray(tasks) && tasks.length > 0) {
                if (tasks.length > 1) {
                  this.logger.info('docFlowTask: result.length > 1 ??');
                }
                const taskWithoutFiles = tasks.pop();
                if (taskWithoutFiles) {
                  const result = this.docFlowTaskWithFiles(client, taskWithoutFiles);
                  return result;
                }
              }
            }

            throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowTask: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowTask: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new UnprocessableEntityException();
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
  docFlowTaskCache = async (user: User, password: string, task: DocFlowTaskInput): Promise<DocFlowTask> => {
    const cachedID = `task:${task.id}`;
    if (this.cache && (!task || task.cache !== false)) {
      const cached: DocFlowTask = await this.cache.get<DocFlowTask>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          try {
            const ticketsTask = await this.docFlowTask(user, password, task);

            if (!deepEqual(ticketsTask, cached, { strict: true })) {
              this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TASK, {
                userId: user.id || '',
                object: ticketsTask,
              });
              this.cache.set<DocFlowTask>(cachedID, ticketsTask, { ttl: this.ttl });
            } else {
              setTimeout(() => this.docFlowTaskCache(user, password, task), TIMEOUT_REFETCH_SERVICES);
            }
          } catch (error) {
            this.logger.error('docFlowTaskCache error:', error);
          }
        })();

        return cached;
      }
    }

    try {
      const ticketsTask = await this.docFlowTask(user, password, task);
      this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TASK, { userId: user.id || '', object: ticketsTask });

      if (this.cache) {
        this.cache.set<DocFlowTask>(cachedID, ticketsTask, { ttl: this.ttl });
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
            this.logger.info(`docFlowCurrentUser: [Request] ${client.lastRequest}`);
            // this.logger.info(`docFlowCurrentUser: [Response] ${client.lastResponse}`);

            if (message[0]?.return?.user) {
              return docFlowUser(message[0].return.user);
            }

            throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowCurrentUser: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowCurrentUser: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new UnprocessableEntityException();
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
            this.logger.info(`docFlowTargetCache: [Request] ${client.lastRequest}`);
            // this.logger.info(`docFlowTargetCache: [Response] ${client.lastResponse}`);

            if (message[0]?.return?.items) {
              return message[0].return.items.map((t) => docFlowTargets(t));
            }

            throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowTargetCache: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowTargetCache: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new UnprocessableEntityException();
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
  docFlowTargetCache = async (user: User, password: string, target: DocFlowTargetInput): Promise<DocFlowTarget> => {
    const cachedID = `target:${target.id}`;
    if (this.cache && (!target || target.cache !== false)) {
      const cached: DocFlowTarget = await this.cache.get<DocFlowTarget>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          try {
            const ticketsTarget = await this.docFlowTarget(user, password, target);

            if (!deepEqual(ticketsTarget, cached, { strict: true })) {
              this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TARGET, {
                userId: user.id || '',
                object: ticketsTarget,
              });
              this.cache.set<DocFlowTarget>(cachedID, ticketsTarget, { ttl: this.ttl });
            } else {
              setTimeout(() => this.docFlowTargetCache(user, password, target), TIMEOUT_REFETCH_SERVICES);
            }
          } catch (error) {
            this.logger.error('docFlowTargetCache error:', error);
          }
        })();

        return cached;
      }
    }

    try {
      const ticketsTarget = await this.docFlowTarget(user, password, target);
      this.pubSub.publish<SubscriptionPayload>(PortalPubSub.DOCFLOW_TARGET, { userId: user.id || '', object: ticketsTarget });

      if (this.cache) {
        this.cache.set<DocFlowTarget>(cachedID, ticketsTarget, { ttl: this.ttl });
      }

      return ticketsTarget;
    } catch (error) {
      this.logger.error('docFlowTargetCache error:', error);

      throw new InternalServerErrorException(error);
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
          .then((message: DataResult<DataObjects<DocFlowFileSOAP>>) => {
            this.logger.info(`docFlowFile: [Request] ${client.lastRequest}`);
            // this.logger.info(`${DocFlowService.name}: [Response] ${client.lastResponse}`);

            if (message[0] && Array.isArray(message[0].return?.objects)) {
              const result = message[0].return.objects.map((f) => docFlowFile(f));

              if (Array.isArray(result) && result.length > 1) {
                this.logger.info('docFlowFile: result.length > 1 ? Something wrong...');
              }

              return result.pop();
            }

            throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
          })
          .catch((error: Error) => {
            this.logger.info(`docFlowFile: [Request] ${client.lastRequest}`);
            this.logger.info(`docFlowFile: [Response] ${client.lastResponse}`);
            this.logger.error(error);

            throw new UnprocessableEntityException();
          });
      }
    }

    throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
  };
}
