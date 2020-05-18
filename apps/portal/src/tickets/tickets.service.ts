/** @format */

// #region Imports NPM
import { Injectable, HttpService } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
// #endregion
// #region Imports Local
import {
  TkRoutes,
  TkTasks,
  TkWhere,
  TkUserOST,
  TkTaskNewInput,
  TkTaskNew,
  TkTaskEditInput,
  TkTask,
} from '@lib/types/tickets';
import { User } from '@lib/types/user.dto';
import { ConfigService } from '@app/config/config.service';
import { SoapService, SoapFault, SoapError, SoapAuthentication } from '@app/soap';
import { constructUploads } from '@back/shared/upload';
import { taskSOAP, AttachesSOAP, serviceOSTicket, taskOSTicket, routesSOAP } from './tickets.util';
// #endregion

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
  TicketsRoutes = async (user: User, password: string): Promise<TkRoutes[]> => {
    const promises: Promise<TkRoutes>[] = [];

    if (!!this.configService.get<string>('SOAP_URL')) {
      const authentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      } as SoapAuthentication;

      const client = await this.soapService.connect(authentication).catch((error) => {
        promises.push(Promise.resolve({ error: JSON.stringify(error) }));
      });

      if (client) {
        promises.push(
          client
            .GetRoutesAsync({ Log: user.username })
            .then((result: any) => {
              this.logger.info(`OldTicketService: [Request] ${client.lastRequest}`);

              if (result?.[0]?.['return']) {
                if (typeof result[0]['return']['Сервис'] === 'object') {
                  return {
                    routes: [
                      ...result[0]['return']['Сервис']?.map((routes: Record<string, any>) =>
                        routesSOAP(routes, TkWhere.Svc1Citil),
                      ),
                    ],
                  };
                }
                return {};
              }

              this.logger.info(`OldTicketService: [Response] ${client.lastResponse}`);
              return {
                error: 'Not connected to SOAP',
              };
            })
            .catch((error: SoapFault) => {
              this.logger.info(`OldTicketService: [Request] ${client.lastRequest}`);
              this.logger.info(`OldTicketService: [Response] ${client.lastResponse}`);

              this.logger.error(error);

              return { error: SoapError(error) };
            }),
        );
      }
    }

    if (!!this.configService.get<string>('OSTICKET_URL')) {
      try {
        const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));

        Object.keys(OSTicketURL).forEach((key) => {
          const osTicketService = this.httpService
            .post<TicketsService[]>(`${OSTicketURL[key]}?req=topic`, {})
            .toPromise()
            .then((response) => {
              if (response.status === 200) {
                if (typeof response.data === 'object') {
                  return {
                    services: [...response.data.map((service: Record<string, any>) => serviceOSTicket(service, key))],
                  };
                }

                return { error: `Not found the OSTicket data in ${key}` };
              }

              return { error: response.statusText };
            });
          promises.push(osTicketService);
        });
      } catch (error) {
        this.logger.error(error);
      }
    }

    return Promise.allSettled(promises).then((values) =>
      values.map((promise) => (promise.status === 'fulfilled' ? promise.value : { error: promise.reason?.message })),
    );
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
  TicketsTasks = async (user: User, password: string, Status: string, Find: string): Promise<TkTasks[]> => {
    const promises: Promise<TkTasks>[] = [];

    if (!!this.configService.get<string>('SOAP_URL')) {
      const authentication: SoapAuthentication = {
        username: user?.username,
        password,
        domain: this.configService.get<string>('SOAP_DOMAIN'),
      };

      const client = await this.soapService.connect(authentication).catch((error) => {
        promises.push(Promise.resolve({ error: JSON.stringify(error) }));
      });

      if (client) {
        promises.push(
          client
            .GetTaskAsync({
              Log: user.username,
              Dept: '',
              Status,
              Executor: false,
              AllTask: false,
            })
            .then((result: any) => {
              this.logger.info(`OldTickets: [Request] ${client.lastRequest}`);

              if (result?.[0]?.['return']) {
                if (typeof result[0]['return']['Задача'] === 'object') {
                  const tasks = Array.isArray(result[0]['return']['Задача'])
                    ? result[0]['return']['Задача']
                    : [result[0]['return']['Задача']];

                  return {
                    tasks: [...tasks.map((task: any) => taskSOAP(task, TkWhere.Svc1Citil))],
                  };
                }
                return {};
              }

              this.logger.info(`OldTickets: [Response] ${client.lastResponse}`);
              return {
                error: 'Not connected to SOAP',
              };
            })
            .catch((error: SoapFault) => {
              this.logger.info(`OldTickets: [Request] ${client.lastRequest}`);
              this.logger.info(`OldTickets: [Response] ${client.lastResponse}`);

              this.logger.error(error);

              return { error: SoapError(error) };
            }),
        );
      }
    }

    if (!!this.configService.get<string>('OSTICKET_URL')) {
      try {
        const OSTicketURL: Record<string, string> = JSON.parse(this.configService.get<string>('OSTICKET_URL'));

        const userOSTicket = {
          company: user.profile.company,
          currentCount: '0',
          email: user.profile.email,
          fio: user.profile.fullName,
          function: user.profile.title,
          manager: '',
          phone: user.profile.telephone,
          phone_ext: user.profile.workPhone,
          subdivision: user.profile.department,
          Аватар: user.profile.thumbnailPhoto,
        } as TkUserOST;

        Object.keys(OSTicketURL).forEach((key) => {
          const osTickets = this.httpService
            .post<Record<string, any>>(`${OSTicketURL[key]}?req=tickets`, {
              login: user.username,
              user: userOSTicket,
              msg: JSON.stringify({ login: user.username, department: '', opened: true }),
            })
            .toPromise()
            .then((response) => {
              if (response.status === 200) {
                if (typeof response.data === 'object') {
                  return {
                    tasks: [...response.data.tickets?.map((task: Record<string, any>) => taskOSTicket(task, key))],
                  };
                }

                return { error: `Not found the OSTicket data in ${key}` };
              }

              return { error: response.statusText };
            });
          promises.push(osTickets);
        });
      } catch (error) {
        this.logger.error(error);
      }
    }

    return Promise.allSettled(promises).then((values) =>
      values.map((promise) => (promise.status === 'fulfilled' ? promise.value : { error: promise.reason?.message })),
    );
  };

  /**
   * New task
   *
   * @async
   * @method TicketsTaskNew
   * @param {User} user User object
   * @param {string} password The Password
   * @param {OldTicketTaskNewInput} ticket Ticket object
   * @param {Promise<FileUpload>[]} attachments Attachments
   * @returns {OldTicketTaskNew} New ticket creation
   */
  TicketsTaskNew = async (
    user: User,
    password: string,
    ticket: TkTaskNewInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<TkTaskNew> => {
    /* 1C SOAP */
    if (ticket.where === TkWhere.Svc1Citil) {
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
        ).catch((error: Error) => {
          this.logger.error(error);

          throw error;
        });
      }

      return client
        .NewTaskAsync({
          Log: user.username,
          Title: ticket.title,
          Description: ticket.body,
          Service: ticket.serviceId,
          Executor: ticket.executorUser ? ticket.executorUser : '',
          Attaches,
        })
        .then((result: any) => {
          this.logger.info(`OldTicketNew: [Request] ${client.lastRequest}`);

          if (result && result[0] && result[0]['return']) {
            return {
              code: result[0]['return']['Код'],
              name: result[0]['return']['Наименование'],
              requisiteSource: result[0]['return']['РеквизитИсточника'],
              category: result[0]['return']['КатегорияУслуги'],
              organization: result[0]['return']['Организация'],
              status: result[0]['return']['ТекущийСтатус'],
              createdDate: result[0]['return']['ВремяСоздания'],
            };
          }

          this.logger.info(`OldTicketNew: [Response] ${client.lastResponse}`);
          return {
            error: 'Not connected to SOAP',
          };
        })
        .catch((error: SoapFault) => {
          this.logger.info(`OldTicketNew: [Request] ${client.lastRequest}`);
          this.logger.info(`OldTicketNew: [Response] ${client.lastResponse}`);

          this.logger.error(error);

          throw SoapError(error);
        });
    }

    /* OSTicket service */
    if (ticket.where === TkWhere.SvcOSTaudit || ticket.where === TkWhere.SvcOSTmedia) {
      return {
        error: 'Cannot connect to OSTicket',
      };
    }

    return {
      error: '"where" is not exists in ticket',
    };
  };

  /**
   * Edit task
   *
   * @async
   * @method TicketsTaskEdit
   * @param {User} user User object
   * @param {string} password The Password
   * @returns {OldTask} Ticket for editing
   */
  TicketsTaskEdit = async (
    user: User,
    password: string,
    ticket: TkTaskEditInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<TkTask> => {
    // TODO: дописать
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
        throw SoapError(error);
      });
    }

    return client
      .EditTaskAsync({
        TaskId: ticket.code,
        NewComment: ticket.comment,
        Executor: '',
        Attaches,
        AutorComment: user.username,
      })
      .then((result: any) => {
        this.logger.info(`OldTicketEdit: [Request] ${client.lastRequest}`);

        if (result && result[0] && result[0]['return']) {
          return taskSOAP(result[0]['return'], '1Citil');
        }

        this.logger.info(`OldTicketEdit: [Response] ${client.lastResponse}`);

        return {
          error: 'Not connected to SOAP',
        };
      })
      .catch((error: SoapFault) => {
        this.logger.info(`OldTicketEdit: [Request] ${client.lastRequest}`);
        this.logger.info(`OldTicketEdit: [Response] ${client.lastResponse}`);

        this.logger.error(error);

        throw SoapError(error);
      });
  };

  /**
   * Task description
   *
   * @async
   * @method TicketsTaskDescription
   * @param {User} user User object
   * @param {string} password The Password
   * @param {string} status
   * @param {string} type
   * @returns {OldService}
   */
  TicketsTaskDescription = async (user: User, password: string, status: string, type: string): Promise<TkTask> => {
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
        TaskId: type,
      })
      .then((result: any) => {
        this.logger.info(`OldTicketDescription: [Request] ${client.lastRequest}`);

        if (result && result[0] && result[0]['return'] && typeof result[0]['return'] === 'object') {
          return taskSOAP(result[0]['return'], '1Citil');
        }

        this.logger.info(`OldTicketDescription: [Response] ${client.lastResponse}`);

        return {
          error: 'Not connected to SOAP',
        };
      })
      .catch((error: SoapFault) => {
        this.logger.info(`OldTicketDescription: [Request] ${client.lastRequest}`);
        this.logger.info(`OldTicketDescription: [Response] ${client.lastResponse}`);

        this.logger.error(error);

        throw SoapError(error);
      });
  };
}
