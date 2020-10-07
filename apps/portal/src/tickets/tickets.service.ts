/** @format */

//#region Imports NPM
import {
  Inject,
  Injectable,
  HttpService,
  NotFoundException,
  NotImplementedException,
  InternalServerErrorException,
  UnauthorizedException,
  UnsupportedMediaTypeException,
  UnprocessableEntityException,
  GatewayTimeoutException,
} from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as CacheManager from 'cache-manager';
import * as RedisStore from 'cache-manager-redis-store';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
//#endregion
//#region Imports Local
import { TIMEOUT_REFETCH_SERVICES, TIMEOUT, PortalPubSub } from '@back/shared/constants';
import type {
  TkUser,
  TkRoute,
  TkRoutes,
  TkTask,
  TkTasks,
  TkEditTask,
  TkTaskNewInput,
  TkTaskNew,
  TkTaskEditInput,
  TkTaskInput,
  TkTasksInput,
  TkFileInput,
  TkFile,
  TkCommentInput,
} from '@lib/types/tickets';
import type {
  SubscriptionPayload,
  TkUserOST,
  RecordsOST,
  TicketsRouteSOAP,
  TicketsUserSOAP,
  TicketsTaskSOAP,
  TicketsSOAPRoutes,
  TicketsSOAPTasks,
  TicketsSOAPTask,
  LoggerContext,
} from '@back/shared/types';
import { TkWhere, TkRoutesInput } from '@lib/types/tickets';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
import { SoapService, SoapFault } from '@app/soap';
import { constructUploads } from '@back/shared/upload';
import { DataResult } from '@lib/types/common';
import { PortalError } from '@back/shared/errors';
import { taskSOAP, AttachesSOAP, descriptionOST, taskOST, routesOST, newOST, routeSOAP, whereService, userSOAP } from './tickets.util';
//#endregion

/**
 * Tickets class
 * @class
 */
@Injectable()
export class TicketsService {
  private ttl: number;
  private cacheStore?: ReturnType<typeof RedisStore.create>;
  private cache?: ReturnType<typeof CacheManager.caching>;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject('PUB_SUB') private readonly pubSub: RedisPubSub,
    private readonly configService: ConfigService,
    private readonly soapService: SoapService,
    private readonly httpService: HttpService,
  ) {
    this.ttl = configService.get<number>('TICKETS_REDIS_TTL') || 900;
    if (configService.get<string>('TICKETS_REDIS_URI')) {
      this.cacheStore = RedisStore.create({
        prefix: 'TICKETS:',
        url: configService.get<string>('TICKETS_REDIS_URI'),
      });
      this.cache = CacheManager.caching({
        store: this.cacheStore,
        ttl: this.ttl,
      });
      logger.info('Redis connection: success', { context: TicketsService.name });
    }
  }

  /**
   * Tickets: get array of routes and services
   *
   * @async
   * @method ticketsRoutes
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {TkRoutes} Services
   */
  ticketsRoutes = async ({
    user,
    password,
    input,
    loggerContext,
  }: {
    user: User;
    password: string;
    input?: TkRoutesInput;
    loggerContext?: LoggerContext;
  }): Promise<TkRoutes> => {
    const promises: Promise<TkRoutes>[] = [];

    /* 1C SOAP */
    const soapUrl = this.configService.get<string>('TICKETS_URL');
    if (soapUrl) {
      const client = await this.soapService
        .connect({
          url: soapUrl,
          username: user?.username,
          password,
          domain: this.configService.get<string>('LDAP_DOMAIN'),
          ntlm: true,
        })
        .catch((error: Error) => {
          this.logger.error(`ticketsRoutes: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          promises.push(Promise.resolve({ routes: null, errors: [PortalError.SOAP_NOT_AUTHORIZED] }));
        });

      if (client) {
        promises.push(
          client
            .GetRoutesAsync({ Log: user.username }, { timeout: TIMEOUT })
            .then((result: DataResult<TicketsSOAPRoutes>) => {
              this.logger.info(`TicketsRoutes: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });

              if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
                const routes = result[0].return?.['Сервис']?.map((route: TicketsRouteSOAP) => routeSOAP(route, TkWhere.SOAP1C));

                return {
                  routes,
                };
              }

              throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
            })
            .catch((error: Error) => {
              this.logger.info(`ticketsRoutes: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
              this.logger.error(`ticketsRoutes: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

              return { errors: [PortalError.SOAP_NOT_AUTHORIZED] };
            }),
        );
      }
    }

    /* OSTicket service */
    const osticketUrl = this.configService.get<string>('OSTICKET_URL');
    if (osticketUrl) {
      try {
        const OSTicketURL: Record<string, string> = JSON.parse(osticketUrl);

        Object.keys(OSTicketURL).forEach((where) => {
          const whereKey = whereService(where);

          switch (whereKey) {
            case TkWhere.OSTaudit:
            case TkWhere.OSTmedia:
            case TkWhere.OSThr:
              break;
            case TkWhere.SOAP1C:
            case TkWhere.Default:
            default:
              throw new NotImplementedException(PortalError.DEFAULT_ROUTE);
          }

          const osTicket = this.httpService
            .post<RecordsOST>(`${OSTicketURL[where]}?req=routes`, {})
            .toPromise()
            .then((response) => {
              if (response.status === 200) {
                if (Object.keys(response.data).length > 0) {
                  if (Array.isArray(response.data.routes)) {
                    return {
                      routes: response.data.routes.map((route) => routesOST(route, whereKey)),
                    } as TkRoutes;
                  }
                }

                return { routes: null, errors: [PortalError.OST_EMPTY_RESULT] };
              }

              return { routes: null, errors: [PortalError.OST_EMPTY_RESULT] };
            });

          promises.push(osTicket);
        });
      } catch (error) {
        this.logger.error(`ticketsRoutes: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });
      }
    }

    return Promise.allSettled(promises)
      .then((values) =>
        values.map((promise) => (promise.status === 'fulfilled' ? promise.value : { routes: null, errors: [promise.reason?.message] })),
      )
      .then((routes: TkRoutes[]) =>
        routes.reduce(
          (accumulator: TkRoutes, current: TkRoutes) => {
            let r: TkRoute[] | null = accumulator.routes;
            let e: string[] | null = accumulator.errors;

            if (Array.isArray(current.routes) && current.routes.length > 0) {
              r = r ? r.concat(current.routes).sort((a, b) => a.name.localeCompare(b.name)) : current.routes;
            }
            if (Array.isArray(current.errors) && current.errors.length > 0) {
              e = e ? e.concat(current.errors) : current.errors;
            }

            return {
              routes: r,
              errors: e,
            };
          },
          { routes: null, errors: null },
        ),
      )
      .catch((error) => {
        throw new InternalServerErrorException(__DEV__ ? error : undefined);
      });
  };

  /**
   * Tickets (cache): get array of routes and services
   *
   * @async
   * @method ticketsRoutesCache
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {TkRoutes} Services
   */
  ticketsRoutesCache = async ({
    user,
    password,
    input,
    loggerContext,
  }: {
    user: User;
    password: string;
    input?: TkRoutesInput;
    loggerContext?: LoggerContext;
  }): Promise<TkRoutes> => {
    const userId = user.id || '';
    const cachedID = 'routes'; // -${user.id}
    if (this.cache && (!input || input.cache !== false)) {
      const cached: TkRoutes = await this.cache.get<TkRoutes>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          try {
            const ticketsRoutes = await this.ticketsRoutes({ user, password, input, loggerContext });

            if (JSON.stringify(ticketsRoutes) !== JSON.stringify(cached)) {
              this.pubSub.publish<SubscriptionPayload<TkRoutes>>(PortalPubSub.TICKETS_ROUTES, {
                userId,
                object: ticketsRoutes,
              });
              if (this.cache) {
                this.cache.set<TkRoutes>(cachedID, ticketsRoutes, { ttl: this.ttl });
              }
            }
          } catch (error) {
            this.logger.error(`ticketsRoutesCache: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });
          }
        })();

        return cached;
      }
    }

    try {
      const ticketsRoutes = await this.ticketsRoutes({ user, password, input, loggerContext });

      if (this.cache) {
        this.cache.set<TkRoutes>(cachedID, ticketsRoutes, { ttl: this.ttl });
      }

      return ticketsRoutes;
    } catch (error) {
      this.logger.error(`ticketsRoutesCache: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

      throw new InternalServerErrorException(__DEV__ ? error : undefined);
    }
  };

  /**
   * Tasks list
   *
   * @async
   * @method ticketsTasks
   * @param {User} user User object
   * @param {string} password The Password
   * @param {string} Status The status
   * @param {string} Find The find string
   * @returns {TkTasks[]}
   */
  ticketsTasks = async ({
    user,
    password,
    tasks,
    loggerContext,
  }: {
    user: User;
    password: string;
    tasks?: TkTasksInput;
    loggerContext?: LoggerContext;
  }): Promise<TkTasks> => {
    const promises: Promise<TkTasks>[] = [];

    /* 1C SOAP */
    const soapUrl = this.configService.get<string>('TICKETS_URL');
    if (soapUrl) {
      const client = await this.soapService
        .connect({
          url: soapUrl,
          username: user?.username,
          password,
          domain: this.configService.get<string>('LDAP_DOMAIN'),
          ntlm: true,
        })
        .catch((error) => {
          this.logger.error(`ticketsTasks: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          promises.push(Promise.resolve({ users: null, tasks: null, errors: [PortalError.SOAP_NOT_AUTHORIZED] }));
        });

      if (client) {
        promises.push(
          client
            .GetTasksAsync(
              {
                Filter: {
                  Users: {
                    Log: user.username,
                  },
                  Departments: {},
                  Statuses: {
                    Status: tasks?.status ?? '',
                  },
                  Context: {},
                },
              },
              { timeout: TIMEOUT },
            )
            .then((result: DataResult<TicketsSOAPTasks>) => {
              this.logger.info(`TicketsTasks: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });

              if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
                return {
                  users: result[0].return?.['Пользователи']?.['Пользователь']?.map((usr: TicketsUserSOAP) => userSOAP(usr, TkWhere.SOAP1C)),
                  tasks: result[0].return?.['Задания']?.['Задание']?.map((task: TicketsTaskSOAP) => taskSOAP(task, TkWhere.SOAP1C)),
                };
              }

              this.logger.info(`TicketsTasks: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
              return {
                errors: [PortalError.SOAP_EMPTY_RESULT],
              };
            })
            .catch((error: SoapFault) => {
              this.logger.info(`ticketsTasks: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });
              this.logger.info(`ticketsTasks: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
              this.logger.error(`ticketsTasks: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

              return { errors: [PortalError.SOAP_NOT_AUTHORIZED] };
            }),
        );
      }
    }

    /* OSTicket service */
    if (this.configService.get<string>('OSTICKET_URL')) {
      try {
        const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));

        const fio = `${user.profile.lastName} ${user.profile.firstName} ${user.profile.middleName}`;
        const userOSTasks = {
          company: user.profile.company,
          email: user.profile.email,
          fio,
          function: user.profile.title,
          manager: '',
          phone: user.profile.telephone,
          phone_ext: user.profile.workPhone,
          subdivision: user.profile.department,
          Аватар: user.profile.thumbnailPhoto,
        } as TkUserOST;

        Object.keys(OSTicketURL).forEach((where) => {
          const whereKey = whereService(where);

          switch (whereKey) {
            case TkWhere.OSTaudit:
            case TkWhere.OSTmedia:
            case TkWhere.OSThr:
              break;
            case TkWhere.SOAP1C:
            case TkWhere.Default:
            default:
              throw new NotImplementedException(PortalError.DEFAULT_ROUTE);
          }

          const osTicket = this.httpService
            .post<RecordsOST>(`${OSTicketURL[where]}?req=tasks`, {
              login: user.username,
              user: JSON.stringify(userOSTasks),
              msg: JSON.stringify({ login: fio, departament: '', opened: true }),
            })
            .toPromise()
            .then((response) => {
              if (response.status === 200) {
                const value = response.data;
                if (value && Object.keys(value).length > 0) {
                  return {
                    tasks: value.tasks?.map((task) => taskOST(task, whereKey)),
                  } as TkTasks;
                }

                return { users: null, tasks: null, errors: [PortalError.OST_EMPTY_RESULT] };
              }

              return { users: null, tasks: null, errors: [PortalError.OST_EMPTY_RESULT] };
            });
          promises.push(osTicket);
        });
      } catch (error) {
        this.logger.error(`ticketsTasks: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });
      }
    }

    return Promise.allSettled(promises)
      .then((values: PromiseSettledResult<TkTasks>[]) =>
        values.map((promise: PromiseSettledResult<TkTasks>) =>
          promise.status === 'fulfilled' ? promise.value : { users: null, tasks: null, errors: [promise.reason?.message] },
        ),
      )
      .then((routes: TkTasks[]) =>
        routes.reduce(
          (accumulator: TkTasks, current: TkTasks) => {
            let t: TkTask[] | null = accumulator.tasks;
            let u: TkUser[] | null = accumulator.users;
            let e: string[] | null = accumulator.errors;

            if (Array.isArray(current.tasks) && current.tasks.length > 0) {
              t = t ? t.concat(current.tasks) : current.tasks;
            }
            if (Array.isArray(current.users) && current.users.length > 0) {
              u = u ? u.concat(current.users) : current.users;
            }
            if (Array.isArray(current.errors) && current.errors.length > 0) {
              e = e ? e.concat(current.errors) : current.errors;
            }

            return {
              tasks: t,
              users: u,
              errors: e,
            };
          },
          { tasks: null, users: null, errors: null },
        ),
      )
      .then(
        (routes: TkTasks) =>
          ({
            tasks:
              routes.tasks?.sort((route, prevRoute) => {
                if (!route.createdDate || !prevRoute.createdDate) {
                  return 0;
                }
                if (route.createdDate < prevRoute.createdDate) {
                  return 1;
                }
                if (route.createdDate > prevRoute.createdDate) {
                  return -1;
                }
                return 0;
              }) || [],
            users: routes.users || [],
            errors: routes.errors || [],
          } as TkTasks),
      )
      .catch((error) => {
        throw new InternalServerErrorException(__DEV__ ? error : undefined);
      });
  };

  /**
   * Tasks list (cache)
   *
   * @async
   * @method ticketsTasksCache
   * @param {User} user User object
   * @param {string} password The Password
   * @param {string} Status The status
   * @param {string} Find The find string
   * @returns {TkTasks}
   */
  ticketsTasksCache = async ({
    user,
    password,
    tasks,
    loggerContext,
  }: {
    user: User;
    password: string;
    tasks?: TkTasksInput;
    loggerContext?: LoggerContext;
  }): Promise<TkTasks> => {
    const userId = user.id || '';
    const cachedID = `tasks:${userId}`;
    if (this.cache && (!tasks || tasks.cache !== false)) {
      const cached: TkTasks = await this.cache.get<TkTasks>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          try {
            const ticketsTasks = await this.ticketsTasks({ user, password, tasks, loggerContext });

            if (JSON.stringify(ticketsTasks) !== JSON.stringify(cached)) {
              this.pubSub.publish<SubscriptionPayload<TkTasks>>(PortalPubSub.TICKETS_TASKS, {
                userId,
                object: ticketsTasks,
              });
              if (this.cache) {
                this.cache.set<TkTasks>(cachedID, ticketsTasks, { ttl: this.ttl });
              }
            } else {
              setTimeout(() => this.ticketsTasksCache({ user, password, tasks, loggerContext }), TIMEOUT_REFETCH_SERVICES);
            }
          } catch (error) {
            this.logger.error(`ticketsTasksCache: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });
          }
        })();

        return cached;
      }
    }

    try {
      const ticketsTasks = await this.ticketsTasks({ user, password, tasks, loggerContext });

      if (this.cache) {
        this.cache.set<TkTasks>(cachedID, ticketsTasks, { ttl: this.ttl });
      }

      return ticketsTasks;
    } catch (error) {
      this.logger.error(`ticketsTasksCache: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

      throw new InternalServerErrorException(__DEV__ ? error : undefined);
    }
  };

  /**
   * New task
   *
   * @async
   * @method ticketsTaskNew
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkTaskNewInput} task Ticket object
   * @param {Promise<FileUpload>[]} attachments Attachments
   * @returns {TkTaskNew} New task creation
   */
  ticketsTaskNew = async ({
    user,
    password,
    task,
    attachments,
    loggerContext,
  }: {
    user: User;
    password: string;
    task: TkTaskNewInput;
    attachments?: Promise<FileUpload>[];
    loggerContext: LoggerContext;
  }): Promise<TkTaskNew> => {
    const Attaches: AttachesSOAP = { Вложение: [] };

    if (attachments) {
      await constructUploads(attachments, ({ filename, file }) =>
        Attaches['Вложение'].push({ DFile: file.toString('base64'), NFile: filename }),
      ).catch((error: Error) => {
        this.logger.error(`ticketsTaskNew: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

        throw error;
      });
    }

    /* 1C SOAP */
    if (task.where === TkWhere.SOAP1C) {
      const client = await this.soapService
        .connect({
          url: this.configService.get<string>('TICKETS_URL'),
          username: user?.username,
          password,
          domain: this.configService.get<string>('LDAP_DOMAIN'),
          ntlm: true,
        })
        .catch((error) => {
          this.logger.error(`ticketsTaskNew: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      return client
        .NewTaskAsync(
          {
            Log: user.username,
            Title: task.subject,
            Description: task.body,
            Route: task.route,
            Service: task.service,
            Executor: task.executorUser ? task.executorUser : '',
            Attaches,
          },
          { timeout: TIMEOUT },
        )
        .then((result?: Record<string, any>) => {
          this.logger.info(`TicketsTaskNew: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });

          if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
            return {
              where: TkWhere.SOAP1C,
              code: result[0].return['Код'],
              subject: result[0].return['Наименование'],
              route: result[0].return['ИмяСервиса'],
              service: result[0].return['ИмяУслуги'],
              organization: result[0].return['Организация'],
              status: result[0].return['ТекущийСтатус'],
              createdDate: new Date(result[0].return['ВремяСоздания']),
            } as TkTaskNew;
          }

          this.logger.info(`TicketsTaskNew: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
          throw new NotFoundException(PortalError.SOAP_EMPTY_RESULT);
        })
        .catch((error: Error) => {
          this.logger.info(`TicketsTaskNew: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });
          this.logger.info(`TicketsTaskNew: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
          this.logger.error(`TicketsTaskNew: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw new InternalServerErrorException(__DEV__ ? error : undefined);
        });
    }

    /* OSTicket service */
    if (task.where === TkWhere.OSTaudit || task.where === TkWhere.OSTmedia || task.where === TkWhere.OSThr) {
      if (this.configService.get<string>('OSTICKET_URL')) {
        try {
          const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));
          const whereKey = Object.keys(OSTicketURL).find((where) => whereService(where) === whereService(task.where));
          if (whereKey) {
            const fio = `${user.profile.lastName} ${user.profile.firstName} ${user.profile.middleName}`;
            const userOSTasks = {
              company: user.profile.company,
              email: user.profile.email,
              fio,
              function: user.profile.title,
              manager: '',
              phone: user.profile.telephone,
              phone_ext: user.profile.workPhone,
              subdivision: user.profile.department,
              Аватар: user.profile.thumbnailPhoto,
            } as TkUserOST;

            return this.httpService
              .post<RecordsOST>(`${OSTicketURL[whereKey]}?req=new`, {
                user: JSON.stringify(userOSTasks),
                msg: JSON.stringify({
                  title: task.subject,
                  descr: task.body,
                  route: task.route,
                  service: task.service,
                  executor: task.executorUser,
                }),
                files: JSON.stringify(Attaches),
              })
              .toPromise()
              .then((response) => {
                if (response.status === 200) {
                  if (Object.keys(response.data).length > 0) {
                    if (typeof response.data.error === 'string') {
                      throw new TypeError(response.data.error);
                    } else {
                      const ticketNew = newOST(response.data, task.where);
                      if (ticketNew) {
                        return ticketNew;
                      }
                    }
                  }

                  throw new NotFoundException(PortalError.OST_EMPTY_RESULT);
                }

                throw new NotFoundException(PortalError.OST_EMPTY_RESULT);
              });
          }
        } catch (error) {
          this.logger.error(`ticketsTaskNew: ${error.toString()}`, { context: TicketsService.name, ...loggerContext });

          throw error;
        }
      }

      throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
    }

    throw new NotImplementedException(PortalError.DEFAULT_ROUTE);
  };

  /**
   * Task description
   *
   * @async
   * @method ticketsTaskDescription
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkTaskDescriptionInput} task Task description
   * @returns {TkTasks}
   */
  ticketsTask = async ({
    user,
    password,
    task,
    loggerContext,
  }: {
    user: User;
    password: string;
    task: TkTaskInput;
    loggerContext?: LoggerContext;
  }): Promise<TkEditTask> => {
    /* 1C SOAP */
    if (task.where === TkWhere.SOAP1C && task.code) {
      const client = await this.soapService
        .connect({
          url: this.configService.get<string>('TICKETS_URL'),
          username: user?.username,
          password,
          domain: this.configService.get<string>('LDAP_DOMAIN'),
          ntlm: true,
        })
        .catch((error) => {
          this.logger.error(`ticketsTask: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      return client
        .GetTaskDescriptionAsync(
          {
            TaskId: task.code,
          },
          { timeout: TIMEOUT },
        )
        .then((result?: DataResult<TicketsSOAPTask>) => {
          this.logger.info(`TicketsTask: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });
          if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
            const usersResult = result[0].return['Пользователи']?.['Пользователь']?.map((u: TicketsUserSOAP) => userSOAP(u, task.where));
            const taskResult = taskSOAP((result[0].return?.['Задания']?.['Задание'] as TicketsTaskSOAP[])[0], task.where);
            if (usersResult && taskResult) {
              return {
                users: usersResult,
                task: taskResult,
              };
            }
          }

          this.logger.info(`TicketsTask: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
          return {
            error: PortalError.SOAP_EMPTY_RESULT,
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTask: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });
          this.logger.info(`TicketsTask: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
          this.logger.error(`TicketsTask: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });
    }

    /* OSTicket service */
    if (task.where === TkWhere.OSTaudit || task.where === TkWhere.OSTmedia || task.where === TkWhere.OSThr) {
      if (this.configService.get<string>('OSTICKET_URL')) {
        try {
          const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));
          const whereKey = Object.keys(OSTicketURL).find((where) => whereService(where) === whereService(task.where));
          if (whereKey) {
            const fio = `${user.profile.lastName} ${user.profile.firstName} ${user.profile.middleName}`;
            const myUserOST = {
              company: user.profile.company,
              email: user.profile.email,
              fio,
              function: user.profile.title,
              manager: '',
              phone: user.profile.telephone,
              phone_ext: user.profile.workPhone,
              subdivision: user.profile.department,
              Аватар: user.profile.thumbnailPhoto,
            } as TkUserOST;

            return this.httpService
              .post<RecordsOST>(`${OSTicketURL[whereKey]}?req=description`, {
                login: user.username,
                user: JSON.stringify(myUserOST),
                msg: JSON.stringify({ login: fio, code: task.code }),
              })
              .toPromise()
              .then((response) => {
                if (response.status === 200) {
                  if (typeof response.data === 'object') {
                    if (typeof response.data.error === 'string') {
                      throw new UnprocessableEntityException(__DEV__ ? response.data.error : undefined);
                    } else {
                      const [users, taskDescription] = descriptionOST(response.data?.description, task.where);
                      if (users && taskDescription) {
                        return {
                          users,
                          task: taskDescription,
                          errors: null,
                        };
                      }
                    }
                  }

                  this.logger.error(`ticketsTask: ${PortalError.OST_EMPTY_RESULT}`, {
                    error: PortalError.OST_EMPTY_RESULT,
                    context: TicketsService.name,
                    ...loggerContext,
                  });
                  throw new NotFoundException(PortalError.OST_EMPTY_RESULT);
                }

                this.logger.error(`ticketsTask: ${PortalError.OST_EMPTY_RESULT}`, {
                  error: PortalError.OST_EMPTY_RESULT,
                  context: TicketsService.name,
                  ...loggerContext,
                });
                throw new NotFoundException(PortalError.OST_EMPTY_RESULT);
              });
          }
        } catch (error) {
          this.logger.error(`ticketsTask: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw error;
        }
      }

      throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
    }

    throw new NotImplementedException(PortalError.DEFAULT_ROUTE);
  };

  /**
   * Task description (cache)
   *
   * @async
   * @method ticketsTaskCache
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkTaskDescriptionInput} task Task description
   * @returns {TkTasks}
   */
  ticketsTaskCache = async ({
    user,
    password,
    task,
    loggerContext,
  }: {
    user: User;
    password: string;
    task: TkTaskInput;
    loggerContext?: LoggerContext;
  }): Promise<TkEditTask> => {
    const userId = user.id || '';
    const cachedID = `task:${task.where}:${task.code}`;
    if (this.cache && (!task || task.cache !== false)) {
      const cached: TkEditTask = await this.cache.get<TkEditTask>(cachedID);
      if (cached && cached !== null) {
        (async (): Promise<void> => {
          try {
            const ticketsTask = await this.ticketsTask({ user, password, task, loggerContext });

            if (JSON.stringify(ticketsTask) !== JSON.stringify(cached)) {
              this.pubSub.publish<SubscriptionPayload<TkEditTask>>(PortalPubSub.TICKETS_TASK, {
                userId,
                object: ticketsTask,
              });
              if (this.cache) {
                this.cache.set<TkEditTask>(cachedID, ticketsTask, { ttl: this.ttl });
              }
            } else {
              setTimeout(() => this.ticketsTaskCache({ user, password, task, loggerContext }), TIMEOUT_REFETCH_SERVICES);
            }
          } catch (error) {
            this.logger.error(`ticketsTaskCache: ${error.toString()}`, { context: TicketsService.name, ...loggerContext });
          }
        })();

        return cached;
      }
    }

    try {
      const ticketsTask = await this.ticketsTask({ user, password, task, loggerContext });

      if (this.cache) {
        this.cache.set<TkEditTask>(cachedID, ticketsTask, { ttl: this.ttl });
      }

      return ticketsTask;
    } catch (error) {
      this.logger.error(`ticketsTaskCache: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

      throw new InternalServerErrorException(__DEV__ ? error : undefined);
    }
  };

  /**
   * Edit task
   *
   * @async
   * @method ticketsTaskEdit
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkTaskEditInput} task The task which will be editing
   * @param {Promise<FileUpload>} attachments Attachments object
   * @returns {TkTasks} Task for editing
   */
  ticketsTaskEdit = async ({
    user,
    password,
    task,
    attachments,
    loggerContext,
  }: {
    user: User;
    password: string;
    task: TkTaskEditInput;
    attachments?: Promise<FileUpload>[];
    loggerContext: LoggerContext;
  }): Promise<TkEditTask> => {
    /* 1C SOAP */
    if (task.where === TkWhere.SOAP1C) {
      const client = await this.soapService
        .connect({
          url: this.configService.get<string>('TICKETS_URL'),
          username: user?.username,
          password,
          domain: this.configService.get<string>('LDAP_DOMAIN'),
          ntlm: true,
        })
        .catch((error) => {
          throw error;
        });

      const Attaches: AttachesSOAP = { Вложение: [] };

      if (attachments) {
        await constructUploads(attachments, ({ filename, file }) =>
          Attaches['Вложение'].push({ DFile: file.toString('base64'), NFile: filename }),
        ).catch((error) => {
          this.logger.error(`ticketsTaskEdit: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw new UnsupportedMediaTypeException(__DEV__ ? error : undefined);
        });
      }

      return client
        .EditTaskAsync(
          {
            TaskId: task.code,
            Executor: '',
            NewComment: task.comment,
            AutorComment: user.username,
            Attaches,
          },
          { timeout: TIMEOUT },
        )
        .then((result: Record<string, any>) => {
          this.logger.info(`TicketsTaskEdit: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });

          if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
            return taskSOAP(result[0].return as TicketsTaskSOAP, TkWhere.SOAP1C);
          }

          this.logger.info(`TicketsTaskEdit: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
          return {
            error: PortalError.SOAP_EMPTY_RESULT,
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTaskEdit: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });
          this.logger.info(`TicketsTaskEdit: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
          this.logger.error(`TicketsTaskEdit: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });
    }

    /* OSTicket service */
    if (task.where === TkWhere.OSTaudit || task.where === TkWhere.OSTmedia || task.where === TkWhere.OSThr) {
      throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
    }

    throw new NotImplementedException(PortalError.DEFAULT_ROUTE);
  };

  /**
   * Get file of task
   *
   * @async
   * @method ticketsTaskFile
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkFileInput} id The task file
   * @returns {TkFile}
   */
  ticketsTaskFile = async ({
    user,
    password,
    file,
    loggerContext,
  }: {
    user: User;
    password: string;
    file: TkFileInput;
    loggerContext?: LoggerContext;
  }): Promise<TkFile> => {
    /* 1C SOAP */
    if (file.where === TkWhere.SOAP1C && file.code) {
      const client = await this.soapService
        .connect({
          url: this.configService.get<string>('TICKETS_URL'),
          username: user?.username,
          password,
          domain: this.configService.get<string>('LDAP_DOMAIN'),
          ntlm: true,
        })
        .catch((error) => {
          this.logger.error(`ticketsTaskFile: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      return client
        .GetTaskFileAsync(
          {
            Ref: file.code,
          },
          { timeout: TIMEOUT },
        )
        .then((result?: Record<string, any>) => {
          this.logger.info(`TicketsTaskFile: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });
          if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
            return {
              ...file,
              id: `${whereService(file.where)}:${file.code}`,
              body: result[0].return['ФайлХранилище'],
              name: `${result[0].return['Наименование']}.${result[0].return['РасширениеФайла']}`,
            };
          }

          this.logger.info(`TicketsTaskFile: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
          return {
            error: PortalError.SOAP_EMPTY_RESULT,
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTaskFile: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });
          this.logger.info(`TicketsTaskFile: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
          this.logger.error(`TicketsTaskFile: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });
    }

    /* OSTicket service */
    if (file.where === TkWhere.OSTaudit || file.where === TkWhere.OSTmedia || file.where === TkWhere.OSThr) {
      if (this.configService.get<string>('OSTICKET_URL')) {
        try {
          const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));
          const whereKey = Object.keys(OSTicketURL).find((where) => whereService(where) === whereService(file.where));
          if (whereKey) {
            const fio = `${user.profile.lastName} ${user.profile.firstName} ${user.profile.middleName}`;
            const myUserOST = {
              company: user.profile.company,
              email: user.profile.email,
              fio,
              function: user.profile.title,
              manager: '',
              phone: user.profile.telephone,
              phone_ext: user.profile.workPhone,
              subdivision: user.profile.department,
              Аватар: user.profile.thumbnailPhoto,
            } as TkUserOST;

            return this.httpService
              .post<RecordsOST>(`${OSTicketURL[whereKey]}?req=file`, {
                login: user.username,
                user: JSON.stringify(myUserOST),
                msg: JSON.stringify({ login: fio, file: file.code }),
              })
              .toPromise()
              .then((response) => {
                if (response.status === 200) {
                  if (typeof response.data === 'object') {
                    if (typeof response.data.error === 'string') {
                      throw new UnprocessableEntityException(__DEV__ ? response.data.error : undefined);
                    } else {
                      return {
                        ...file,
                        id: `${whereService(file.where)}:${file.code}`,
                        body: (response.data.file as unknown) as string,
                        name: null,
                        mime: null,
                      };
                    }
                  }

                  throw new NotFoundException(PortalError.OST_EMPTY_RESULT);
                }

                throw new NotFoundException(PortalError.OST_EMPTY_RESULT);
              });
          }
        } catch (error) {
          this.logger.error(`ticketsTaskFile: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw error;
        }
      }

      throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
    }

    throw new NotImplementedException(PortalError.DEFAULT_ROUTE);
  };

  /**
   * Get file of comment
   *
   * @async
   * @method ticketsComment
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkFileInput} id The task file
   * @returns {TkFile}
   */
  ticketsComment = async ({
    user,
    password,
    comment,
    loggerContext,
  }: {
    user: User;
    password: string;
    comment: TkCommentInput;
    loggerContext?: LoggerContext;
  }): Promise<TkFile> => {
    /* 1C SOAP */
    if (comment.where === TkWhere.SOAP1C && comment.code) {
      const client = await this.soapService
        .connect({
          url: this.configService.get<string>('TICKETS_URL'),
          username: user?.username,
          password,
          domain: this.configService.get<string>('LDAP_DOMAIN'),
          ntlm: true,
        })
        .catch((error) => {
          this.logger.error(`ticketsComment: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw new UnauthorizedException(PortalError.SOAP_NOT_AUTHORIZED);
        });

      return client
        .GetCommentFileAsync(
          {
            Ref: comment.code,
          },
          { timeout: TIMEOUT },
        )
        .then((result?: Record<string, any>) => {
          this.logger.info(`ticketsComment: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });
          if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
            return {
              ...comment,
              body: result[0].return['ФайлХранилище'],
            };
          }

          this.logger.info(`ticketsComment: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
          return {
            error: PortalError.SOAP_EMPTY_RESULT,
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`ticketsComment: [Request] ${client.lastRequest}`, { context: TicketsService.name, ...loggerContext });
          this.logger.info(`ticketsComment: [Response] ${client.lastResponse}`, { context: TicketsService.name, ...loggerContext });
          this.logger.error(`ticketsComment: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw new UnprocessableEntityException(__DEV__ ? error : undefined);
        });
    }

    /* OSTicket service */
    if (comment.where === TkWhere.OSTaudit || comment.where === TkWhere.OSTmedia || comment.where === TkWhere.OSThr) {
      if (this.configService.get<string>('OSTICKET_URL')) {
        try {
          const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));
          const whereKey = Object.keys(OSTicketURL).find((where) => whereService(where) === whereService(comment.where));
          if (whereKey) {
            const fio = `${user.profile.lastName} ${user.profile.firstName} ${user.profile.middleName}`;
            const myUserOST = {
              company: user.profile.company,
              email: user.profile.email,
              fio,
              function: user.profile.title,
              manager: '',
              phone: user.profile.telephone,
              phone_ext: user.profile.workPhone,
              subdivision: user.profile.department,
              Аватар: user.profile.thumbnailPhoto,
            } as TkUserOST;

            return this.httpService
              .post<RecordsOST>(`${OSTicketURL[whereKey]}?req=file`, {
                login: user.username,
                user: JSON.stringify(myUserOST),
                msg: JSON.stringify({ login: fio, file: comment.code }),
              })
              .toPromise()
              .then((response) => {
                if (response.status === 200) {
                  if (typeof response.data === 'object') {
                    if (typeof response.data.error === 'string') {
                      throw new TypeError(response.data.error);
                    } else {
                      return {
                        ...comment,
                        id: `${whereService(comment.where)}:${comment.code}`,
                        body: (response.data.file as unknown) as string,
                        name: null,
                        mime: null,
                      };
                    }
                  }

                  throw new NotFoundException(PortalError.OST_EMPTY_RESULT);
                }

                throw new NotFoundException(PortalError.OST_EMPTY_RESULT);
              });
          }
        } catch (error) {
          this.logger.error(`ticketsComment: ${error.toString()}`, { error, context: TicketsService.name, ...loggerContext });

          throw new UnprocessableEntityException(__DEV__ ? error : undefined);
        }
      }

      throw new NotImplementedException(PortalError.NOT_IMPLEMENTED);
    }

    throw new NotImplementedException(PortalError.DEFAULT_ROUTE);
  };
}
