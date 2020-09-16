/** @format */

//#region Imports NPM
import { Injectable, HttpService } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
//#endregion
//#region Imports Local
import type {
  TkRoutes,
  TkTasks,
  TkEditTask,
  TkUserOST,
  TkTaskNewInput,
  TkTaskNew,
  TkTaskEditInput,
  TkTaskDescriptionInput,
  TkTasksInput,
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
import { TkWhere } from '@lib/types/tickets';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
import { SoapService, SoapFault, soapError, SoapConnect } from '@app/soap';
import { constructUploads } from '@back/shared/upload';
import { DataResultSOAP } from '@lib/types/common';
import { taskSOAP, AttachesSOAP, descriptionOST, taskOST, routesOST, newOST, routeSOAP, whereService, userSOAP } from './tickets.util';
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
    const soapUrl = this.configService.get<string>('TICKETS_URL');
    if (soapUrl) {
      // TODO: cache

      const client = await this.soapService
        .connect({
          url: soapUrl,
          username: user?.username,
          password,
          domain: this.configService.get<string>('LDAP_DOMAIN'),
          ntlm: true,
        })
        .catch((error: Error) => {
          promises.push(Promise.resolve({ errors: [error.toString()] }));
        });

      if (client) {
        promises.push(
          client
            .GetRoutesAsync({ Log: user.username })
            .then((result: DataResultSOAP<TicketsSOAPGetRoutes>) => {
              this.logger.info(`TicketsRoutes: [Request] ${client.lastRequest}`);

              if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
                return {
                  routes: result[0].return?.['Сервис']?.map((route: TicketsRouteSOAP) => routeSOAP(route, TkWhere.SOAP1C)),
                };
              }

              throw new Error('Not connected to SOAP');
            })
            .catch((error: Error | SoapFault) => {
              if (error instanceof Error) {
                this.logger.info(`TicketsRoutes: [Response] ${client.lastResponse}`);
                this.logger.error(error);

                return { errors: [`SOAP: ${soapError(error)}`] };
              }
              this.logger.error(error);

              return { errors: [`SOAP: ${soapError(error)}`] };
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
      .then((values) => values.map((promise) => (promise.status === 'fulfilled' ? promise.value : { errors: [promise.reason?.message] })))
      .then((routes: TkRoutes[]) =>
        routes.reduce(
          (accumulator: TkRoutes, current: TkRoutes) => {
            if (Array.isArray(current.routes) && current.routes.length > 0) {
              accumulator.routes = accumulator.routes?.concat(current.routes).sort((a, b) => a.name.localeCompare(b.name));
            }
            if (Array.isArray(current.errors) && current.errors.length > 0) {
              accumulator.errors = accumulator.errors?.concat(current.errors);
            }
            return accumulator;
          },
          { routes: [], errors: [] },
        ),
      )
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
  TicketsTasks = async (user: User, password: string, tasks?: TkTasksInput): Promise<TkTasks> => {
    const promises: Promise<TkTasks>[] = [];

    /* 1C SOAP */
    const soapUrl = this.configService.get<string>('TICKETS_URL');
    if (soapUrl) {
      // TODO: cache

      const client = await this.soapService
        .connect({
          url: soapUrl,
          username: user?.username,
          password,
          domain: this.configService.get<string>('LDAP_DOMAIN'),
          ntlm: true,
        })
        .catch((error) => {
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
                  Status: tasks?.status ?? '',
                },
                Context: {},
              },
            })
            .then((result: DataResultSOAP<TicketsSOAPGetTasks>) => {
              this.logger.info(`TicketsTasks: [Request] ${client.lastRequest}`);

              if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
                return {
                  users: result[0].return?.['Пользователи']?.['Пользователь']?.map((usr: TicketsUserSOAP) => userSOAP(usr, TkWhere.SOAP1C)),
                  tasks: result[0].return?.['Задания']?.['Задание']?.map((task: TicketsTaskSOAP) => taskSOAP(task, TkWhere.SOAP1C)),
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

              return { errors: [`SOAP: ${soapError(error)}`] };
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
              throw new Error('Can not use a default route');
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
      .then((routes: TkTasks[]) =>
        routes.reduce(
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
  TicketsTaskNew = async (user: User, password: string, task: TkTaskNewInput, attachments?: Promise<FileUpload>[]): Promise<TkTaskNew> => {
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
        .then((result?: Record<string, any>) => {
          this.logger.info(`TicketsTaskNew: [Request] ${client.lastRequest}`);

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

          this.logger.info(`TicketsTaskNew: [Response] ${client.lastResponse}`);
          throw new Error('Not connected to SOAP');
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTaskNew: [Request] ${client.lastRequest}`);
          this.logger.info(`TicketsTaskNew: [Response] ${client.lastResponse}`);
          this.logger.error(error);

          throw new Error(soapError(error));
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
      // TODO: cache

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

      return client
        .GetTaskDescriptionAsync({
          TaskId: task.code,
        })
        .then((result?: DataResultSOAP<TicketsSOAPGetTaskDescription>) => {
          this.logger.info(`TicketsTaskDescription: [Request] ${client.lastRequest}`);
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

          this.logger.info(`TicketsTaskDescription: [Response] ${client.lastResponse}`);
          return {
            error: 'Not connected to SOAP',
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTaskDescription: [Request] ${client.lastRequest}`);
          this.logger.info(`TicketsTaskDescription: [Response] ${client.lastResponse}`);
          this.logger.error(error);

          throw new Error(soapError(error));
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
                      throw new TypeError(response.data.error);
                    } else {
                      const [users, taskDescription] = descriptionOST(response.data?.description, task.where);
                      if (users && taskDescription) {
                        return {
                          users,
                          task: taskDescription,
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

  /**
   * Edit task
   *
   * @async
   * @method TicketsTaskEdit
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkTaskEditInput} task The task which will be editing
   * @param {Promise<FileUpload>} attachments Attachments object
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
      // TODO: cache

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
        ).catch((error: SoapFault) => {
          this.logger.error(error);

          throw new Error(soapError(error));
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
        .then((result: Record<string, any>) => {
          this.logger.info(`TicketsTaskEdit: [Request] ${client.lastRequest}`);

          if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
            return taskSOAP(result[0].return as TicketsTaskSOAP, TkWhere.SOAP1C);
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

          throw new Error(soapError(error));
        });
    }

    /* OSTicket service */
    if (task.where === TkWhere.OSTaudit || task.where === TkWhere.OSTmedia || task.where === TkWhere.OSThr) {
      throw new Error('Not implemented');
    }

    throw new Error('Can not use a default route');
  };

  /**
   * Get file of task
   *
   * @async
   * @method TicketsTaskFile
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkFileInput} id The task file
   * @returns {TkFile}
   */
  TicketsTaskFile = async (user: User, password: string, file: TkFileInput): Promise<TkFile> => {
    /* 1C SOAP */
    if (file.where === TkWhere.SOAP1C && file.id) {
      // TODO: cache

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

      return client
        .GetTaskFileAsync({
          Ref: file.id,
        })
        .then((result?: Record<string, any>) => {
          this.logger.info(`TicketsTaskFile: [Request] ${client.lastRequest}`);
          if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
            return {
              ...file,
              body: result[0].return['ФайлХранилище'],
              name: `${result[0].return['Наименование']}.${result[0].return['РасширениеФайла']}`,
            };
          }

          this.logger.info(`TicketsTaskFile: [Response] ${client.lastResponse}`);
          return {
            error: 'Not connected to SOAP',
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTaskFile: [Request] ${client.lastRequest}`);
          this.logger.info(`TicketsTaskFile: [Response] ${client.lastResponse}`);
          this.logger.error(error);

          throw new Error(soapError(error));
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
                msg: JSON.stringify({ login: fio, file: file.id }),
              })
              .toPromise()
              .then((response) => {
                if (response.status === 200) {
                  if (typeof response.data === 'object') {
                    if (typeof response.data.error === 'string') {
                      throw new TypeError(response.data.error);
                    } else {
                      return {
                        ...file,
                        body: (response.data.file as unknown) as string,
                      };
                    }
                  }
                  throw new Error(`Not found the OSTicket data in "${file.where}"`);
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
   * Get file of comment
   *
   * @async
   * @method TicketsCommentFile
   * @param {User} user User object
   * @param {string} password The Password
   * @param {TkFileInput} id The task file
   * @returns {TkFile}
   */
  TicketsCommentFile = async (user: User, password: string, file: TkFileInput): Promise<TkFile> => {
    /* 1C SOAP */
    if (file.where === TkWhere.SOAP1C && file.id) {
      // TODO: cache

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

      return client
        .GetCommentFileAsync({
          Ref: file.id,
        })
        .then((result?: Record<string, any>) => {
          this.logger.info(`TicketsTaskFile: [Request] ${client.lastRequest}`);
          if (result?.[0]?.return && Object.keys(result[0].return).length > 0) {
            return {
              ...file,
              body: result[0].return['ФайлХранилище'],
            };
          }

          this.logger.info(`TicketsTaskFile: [Response] ${client.lastResponse}`);
          return {
            error: 'Not connected to SOAP',
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`TicketsTaskFile: [Request] ${client.lastRequest}`);
          this.logger.info(`TicketsTaskFile: [Response] ${client.lastResponse}`);
          this.logger.error(error);

          throw new Error(soapError(error));
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
                msg: JSON.stringify({ login: fio, file: file.id }),
              })
              .toPromise()
              .then((response) => {
                if (response.status === 200) {
                  if (typeof response.data === 'object') {
                    if (typeof response.data.error === 'string') {
                      throw new TypeError(response.data.error);
                    } else {
                      return {
                        ...file,
                        body: (response.data.file as unknown) as string,
                      };
                    }
                  }
                  throw new Error(`Not found the OSTicket data in "${file.where}"`);
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
