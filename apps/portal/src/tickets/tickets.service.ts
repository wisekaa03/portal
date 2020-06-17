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
} from '@lib/types/tickets';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
import { SoapService, SoapFault, SoapError, SoapAuthentication } from '@app/soap';
import { constructUploads } from '@back/shared/upload';
import {
  taskSOAP,
  AttachesSOAP,
  userOST,
  taskOST,
  routesOST,
  newOST,
  routeSOAP,
  whereService,
  userSOAP,
} from './tickets.util';
//#endregion

/**
 * Tickets class
 * @class
 */
@Injectable()
export class TicketsService {
  constructor(
    @InjectPinoLogger(TicketsService.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly soapService: SoapService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Tickets: get array of routes and services
   *
   * @async
   * @method TicketsRoutes
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {TkRoutes[]} Services
   */
  TicketsRoutes = async (user: User, password: string): Promise<TkRoutes> => {
    const promises: Promise<TkRoutes>[] = [];

    /* 1C SOAP */
    if (this.configService.get<string>('SOAP_URL')) {
      const authentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      const client = await this.soapService.connect(authentication).catch((error: Error) => {
        promises.push(Promise.resolve({ errors: [error.toString()] }));
      });

      if (client) {
        promises.push(
          client
            .GetRoutesAsync({ Log: user.username })
            .then((result: any) => {
              this.logger.info(`TicketsRoutes: [Request] ${client.lastRequest}`);

              if (Object.keys(result?.[0]?.['return']).length > 0) {
                const routes = result[0]['return']['Сервис'];

                if (Array.isArray(routes)) {
                  return {
                    routes: routes.map((route: Record<string, any>) => routeSOAP(route, TkWhere.SOAP1C)),
                  };
                }
              }

              this.logger.info(`TicketsRoutes: [Response] ${client.lastResponse}`);
              return {
                errors: ['Not connected to SOAP'],
              };
            })
            .catch((error: SoapFault) => {
              this.logger.info(`TicketsRoutes: [Request] ${client.lastRequest}`);
              this.logger.info(`TicketsRoutes: [Response] ${client.lastResponse}`);
              this.logger.error(error);

              return { errors: [`SOAP: ${new SoapError(error).toString()}`] };
            }),
        );
      }
    }

    /* OSTicket service */
    if (this.configService.get<string>('OSTICKET_URL')) {
      try {
        const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));

        Object.keys(OSTicketURL).forEach((where) => {
          const whereKey = whereService(where);

          switch (whereKey) {
            case TkWhere.OSTaudit:
            case TkWhere.OSTmedia:
              break;
            case TkWhere.SOAP1C:
            case TkWhere.Default:
            default:
              throw new Error('Can not use a default route');
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

                return { errors: [`Not found the OSTicket data in "${where}"`] };
              }

              return { errors: [response.statusText] };
            });

          promises.push(osTicket);
        });
      } catch (error) {
        this.logger.error(error);
      }
    }

    return Promise.allSettled(promises)
      .then((values) =>
        values.map((promise) =>
          promise.status === 'fulfilled' ? promise.value : { errors: [promise.reason?.message] },
        ),
      )
      .then((routes: TkRoutes[]) => {
        return routes.reduce(
          (accumulator: TkRoutes, current: TkRoutes) => {
            if (Array.isArray(current.routes) && current.routes.length > 0) {
              accumulator.routes = accumulator.routes
                ?.concat(current.routes)
                .sort((a, b) => a.name.localeCompare(b.name));
            }
            if (Array.isArray(current.errors) && current.errors.length > 0) {
              accumulator.errors = accumulator.errors?.concat(current.errors);
            }
            return accumulator;
          },
          { routes: [], errors: [] },
        );
      })
      .catch((error) => {
        throw new Error(error);
      });
  };

  /**
   * Tasks list
   *
   * @async
   * @method TicketsTasks
   * @param {User} user User object
   * @param {string} password The Password
   * @param {string} Status The status
   * @param {string} Find The find string
   * @returns {TkTasks[]}
   */
  TicketsTasks = async (user: User, password: string, Status: string, Find: string): Promise<TkTasks> => {
    const promises: Promise<TkTasks>[] = [];

    /* 1C SOAP */
    if (this.configService.get<string>('SOAP_URL')) {
      const authentication: SoapAuthentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      };

      const client = await this.soapService.connect(authentication).catch((error) => {
        promises.push(Promise.resolve({ errors: [JSON.stringify(error)] }));
      });

      if (client) {
        promises.push(
          client
            .GetTasksAsync({
              Filter: {
                Users: {
                  Log: user.username,
                },
                Departments: {},
                Statuses: {
                  Status,
                },
                Context: {},
              },
            })
            .then((result: any) => {
              this.logger.info(`TicketsTasks: [Request] ${client.lastRequest}`);
              const returnValue = result?.[0]?.['return'];

              if (returnValue && Object.keys(returnValue).length > 0) {
                const users = returnValue['Пользователи']['Пользователь'];
                const tasks = returnValue['Задания']['Задание'];

                return {
                  users: users?.map((usr: Record<string, any>) => userSOAP(usr, TkWhere.SOAP1C)),
                  tasks: tasks?.map((task: Record<string, any>) => taskSOAP(task, TkWhere.SOAP1C)),
                };
              }

              this.logger.info(`TicketsTasks: [Response] ${client.lastResponse}`);
              return {
                errors: ['Not connected to SOAP'],
              };
            })
            .catch((error: SoapFault) => {
              this.logger.info(`TicketsTasks: [Request] ${client.lastRequest}`);
              this.logger.info(`TicketsTasks: [Response] ${client.lastResponse}`);
              this.logger.error(error);

              return { errors: [`SOAP: ${new SoapError(error).toString()}`] };
            }),
        );
      }
    }

    /* OSTicket service */
    if (this.configService.get<string>('OSTICKET_URL')) {
      try {
        const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));

        const fio = `${user.profile.lastName} ${user.profile.firstName} ${user.profile.middleName}`;
        const userOST = {
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
              break;
            case TkWhere.SOAP1C:
            case TkWhere.Default:
            default:
              throw new Error('Can not use a default route');
          }

          const osTicket = this.httpService
            .post<RecordsOST>(`${OSTicketURL[where]}?req=tasks`, {
              login: user.username,
              user: JSON.stringify(userOST),
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

                return { errors: [`Not found the OSTicket data in ${where}`] };
              }

              return { errors: [response.statusText] };
            });
          promises.push(osTicket);
        });
      } catch (error) {
        this.logger.error(error);
      }
    }

    return Promise.allSettled(promises)
      .then((values: PromiseSettledResult<TkTasks>[]) =>
        values.map((promise: PromiseSettledResult<TkTasks>) =>
          promise.status === 'fulfilled' ? promise.value : { errors: [promise.reason?.message] },
        ),
      )
      .then((routes: TkTasks[]) => {
        return routes.reduce(
          (accumulator: TkTasks, current: TkTasks) => {
            if (Array.isArray(current.tasks) && current.tasks.length > 0) {
              accumulator.tasks = accumulator.tasks?.concat(current.tasks);
            }
            if (Array.isArray(current.users) && current.users.length > 0) {
              accumulator.users = accumulator.users?.concat(current.users);
            }
            if (Array.isArray(current.errors) && current.errors.length > 0) {
              accumulator.errors = accumulator.errors?.concat(current.errors);
            }
            return accumulator;
          },
          { tasks: [], users: [], errors: [] } as TkTasks,
        );
      })
      .catch((error: TypeError) => {
        throw error;
      });
  };

  /**
   * New task
   *
   * @async
   * @method TicketsTaskNew
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkTaskNewInput} task Ticket object
   * @param {Promise<FileUpload>[]} attachments Attachments
   * @returns {TkTaskNew} New task creation
   */
  TicketsTaskNew = async (
    user: User,
    password: string,
    task: TkTaskNewInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<TkTaskNew> => {
    const Attaches: AttachesSOAP = { Вложение: [] };

    if (attachments) {
      await constructUploads(attachments, ({ filename, file }) =>
        Attaches['Вложение'].push({ DFile: file.toString('base64'), NFile: filename }),
      ).catch((error: Error) => {
        this.logger.error(error);

        throw error;
      });
    }

    /* 1C SOAP */
    if (task.where === TkWhere.SOAP1C) {
      const authentication: SoapAuthentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      };

      const client = await this.soapService.connect(authentication).catch((error) => {
        throw error;
      });

      return client
        .NewTaskAsync({
          Log: user.username,
          Title: task.subject,
          Description: task.body,
          Route: task.route,
          Service: task.service,
          Executor: task.executorUser ? task.executorUser : '',
          Attaches,
        })
        .then((result?: Record<string, undefined>) => {
          this.logger.info(`TicketsTaskNew: [Request] ${client.lastRequest}`);

          const returnValue = result?.[0]?.['return'];
          if (returnValue && typeof returnValue === 'object') {
            return {
              where: TkWhere.SOAP1C,
              code: returnValue['Код'],
              subject: returnValue['Наименование'],
              route: returnValue['ИмяСервиса'],
              service: returnValue['ИмяУслуги'],
              organization: returnValue['Организация'],
              status: returnValue['ТекущийСтатус'],
              createdDate: new Date(returnValue['ВремяСоздания']),
            } as TkTaskNew;
          }

          this.logger.info(`TicketsTaskNew: [Response] ${client.lastResponse}`);
          throw new Error('Not connected to SOAP');
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTaskNew: [Request] ${client.lastRequest}`);
          this.logger.info(`TicketsTaskNew: [Response] ${client.lastResponse}`);
          this.logger.error(error);

          throw new SoapError(error);
        });
    }

    /* OSTicket service */
    if (task.where === TkWhere.OSTaudit || task.where === TkWhere.OSTmedia) {
      if (this.configService.get<string>('OSTICKET_URL')) {
        try {
          const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));
          const whereKey = Object.keys(OSTicketURL).find((where) => whereService(where) === whereService(task.where));
          if (whereKey) {
            const fio = `${user.profile.lastName} ${user.profile.firstName} ${user.profile.middleName}`;
            const userOST = {
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
                user: JSON.stringify(userOST),
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

                  throw new Error(`Not found the OSTicket data in "${whereKey}"`);
                }

                throw new Error(response.statusText);
              });
          }
        } catch (error) {
          this.logger.error(error);

          throw error;
        }
      }

      throw new Error('Not implemented');
    }

    throw new Error('Can not use a default route');
  };

  /**
   * Edit task
   *
   * @async
   * @method TicketsTaskEdit
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkTaskEditInput} task The task which will be editing
   * @param {FileUpload} attachments Attachments object
   * @returns {TkTasks} Task for editing
   */
  TicketsTaskEdit = async (
    user: User,
    password: string,
    task: TkTaskEditInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<TkEditTask> => {
    /* 1C SOAP */
    if (task.where === TkWhere.SOAP1C) {
      const authentication: SoapAuthentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      };

      const client = await this.soapService.connect(authentication).catch((error) => {
        throw error;
      });

      const Attaches: AttachesSOAP = { Вложение: [] };

      if (attachments) {
        await constructUploads(attachments, ({ filename, file }) =>
          Attaches['Вложение'].push({ DFile: file.toString('base64'), NFile: filename }),
        ).catch((error: SoapFault) => {
          this.logger.error(error);

          throw new SoapError(error);
        });
      }

      return client
        .EditTaskAsync({
          TaskId: task.code,
          Executor: '',
          NewComment: task.comment,
          AutorComment: user.username,
          Attaches,
        })
        .then((result?: Record<string, undefined>) => {
          this.logger.info(`TicketsTaskEdit: [Request] ${client.lastRequest}`);

          const returnValue = result?.[0]?.['return'];
          if (returnValue && typeof returnValue === 'object') {
            return taskSOAP(returnValue, TkWhere.SOAP1C);
          }

          this.logger.info(`TicketsTaskEdit: [Response] ${client.lastResponse}`);
          return {
            error: 'Not connected to SOAP',
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTaskEdit: [Request] ${client.lastRequest}`);
          this.logger.info(`TicketsTaskEdit: [Response] ${client.lastResponse}`);
          this.logger.error(error);

          throw new SoapError(error);
        });
    }

    /* OSTicket service */
    if (task.where === TkWhere.OSTaudit || task.where === TkWhere.OSTmedia) {
      throw new Error('Not implemented');
    }

    throw new Error('Can not use a default route');
  };

  /**
   * Task description
   *
   * @async
   * @method TicketsTaskDescription
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkTaskDescriptionInput} task Task description
   * @returns {TkTasks}
   */
  TicketsTaskDescription = async (user: User, password: string, task: TkTaskDescriptionInput): Promise<TkEditTask> => {
    /* 1C SOAP */
    if (task.where === TkWhere.SOAP1C && task.code) {
      const authentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      const client = await this.soapService.connect(authentication).catch((error) => {
        throw error;
      });

      return client
        .GetTaskDescriptionAsync({
          TaskId: task.code,
        })
        .then((result: any) => {
          this.logger.info(`TicketsTaskDescription: [Request] ${client.lastRequest}`);
          const returnValue = result[0]?.['return'];

          if (returnValue && Object.keys(returnValue).length > 0) {
            const usersResult = returnValue['Пользователи']?.['Пользователь'].map((user: any) =>
              userSOAP(user, task.where),
            );
            const taskResult = taskSOAP(returnValue['Задания']?.['Задание']?.['0'], task.where);
            if (usersResult && taskResult) {
              return {
                users: usersResult,
                task: taskResult,
              };
            }
          }

          this.logger.info(`TicketsTaskDescription: [Response] ${client.lastResponse}`);
          return {
            error: 'Not connected to SOAP',
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTaskDescription: [Request] ${client.lastRequest}`);
          this.logger.info(`TicketsTaskDescription: [Response] ${client.lastResponse}`);
          this.logger.error(error);

          throw new SoapError(error);
        });
    }

    /* OSTicket service */
    if (task.where === TkWhere.OSTaudit || task.where === TkWhere.OSTmedia) {
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
                      throw new TypeError(response.data.error);
                    } else {
                      const userTask = userOST(response.data?.description, task.where);
                      const taskTask = taskOST(response.data?.description, task.where);
                      if (userTask && taskTask) {
                        return {
                          users: [userTask],
                          tasks: [taskTask],
                        };
                      }
                    }
                  }
                  throw new Error(`Not found the OSTicket data in "${task.where}"`);
                }
                throw new Error(response.statusText);
              });
          }
        } catch (error) {
          this.logger.error(error);

          throw error;
        }
      }

      throw new Error('Not implemented');
    }

    throw new Error('Can not use a default route');
  };
}
