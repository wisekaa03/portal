/** @format */

// #region Imports NPM
import { Injectable, HttpService } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
// #endregion
// #region Imports Local
import {
  OldService,
  OldTask,
  OldServices,
  OldTasks,
  WhereService,
  User,
  OSTicketUser,
  OldTicketTaskNew,
  OldTicketTaskNewInput,
  OldTicketTaskEditInput,
} from '@lib/types';
import { ConfigService } from '@app/config/config.service';
import { SoapService, SoapFault, SoapError, SoapAuthentication } from '@app/soap';
import { constructUploads } from '@back/shared/upload';
import { taskSOAP, serviceSOAP, AttachesSOAP, serviceOSTicket, taskOSTicket } from './old-service.util';
// #endregion

/**
 * Tickets class
 * @class
 */
@Injectable()
export class OldTicketService {
  constructor(
    @InjectPinoLogger(OldTicketService.name) private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly soapService: SoapService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Tickets: get array of services
   *
   * @async
   * @method OldTicketService
   * @param {SoapAuthentication} authentication Soap authentication
   * @param {User} user User object
   * @param {string} find The find string
   * @returns {OldServices[]} Services
   */
  OldTicketService = async (authentication: SoapAuthentication, user: User, Find: string): Promise<OldServices[]> => {
    const promises: Promise<OldServices>[] = [];

    if (!!this.configService.get<string>('SOAP_URL')) {
      const client = await this.soapService.connect(authentication).catch((error) => {
        promises.push(Promise.resolve({ error: JSON.stringify(error) }));
      });

      if (client) {
        promises.push(
          client
            .GetServicesAsync({ Log: user.username, Find })
            .then((result: any) => {
              this.logger.info(`OldTicketService: [Request] ${client.lastRequest}`);

              if (result?.[0]?.['return']) {
                if (typeof result[0]['return']['Услуга'] === 'object') {
                  return {
                    services: [
                      ...result[0]['return']['Услуга']?.map((service: Record<string, any>) =>
                        serviceSOAP(service, WhereService.Svc1Citil),
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
            .post<OldServices[]>(`${OSTicketURL[key]}?req=topic`, {})
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
   * @method OldTasks
   * @param {SoapAuthentication} authentication Soap authentication
   * @param {User} user User object
   * @param {string} Status The status
   * @param {string} Find The find string
   * @returns {OldTasks[]}
   */
  OldTasks = async (
    authentication: SoapAuthentication,
    user: User,
    Status: string,
    Find: string,
  ): Promise<OldTasks[]> => {
    const promises: Promise<OldTasks>[] = [];

    if (!!this.configService.get<string>('SOAP_URL')) {
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
                    tasks: [...tasks.map((task: any) => taskSOAP(task, WhereService.Svc1Citil))],
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
        } as OSTicketUser;

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
   * @method OldTicketTaskNew
   * @param {SoapAuthentication} authentication Soap authentication
   * @param {User} user User object
   * @param {OldTicketTaskNewInput} ticket Ticket object
   * @param {Promise<FileUpload>[]} attachments Attachments
   * @returns {OldTicketTaskNew} New ticket creation
   */
  OldTicketTaskNew = async (
    authentication: SoapAuthentication,
    user: User,
    ticket: OldTicketTaskNewInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<OldTicketTaskNew> => {
    /* 1C SOAP */
    if (ticket.where === WhereService.Svc1Citil) {
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
    if (ticket.where === WhereService.SvcOSTaudit || ticket.where === WhereService.SvcOSTmedia) {
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
   * @method OldTicketTaskEdit
   * @param {SoapAuthentication} authentication Soap authentication
   * @param {User} user User object
   * @returns {OldTask} Ticket for editing
   */
  OldTicketTaskEdit = async (
    authentication: SoapAuthentication,
    user: User,
    ticket: OldTicketTaskEditInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<OldTask> => {
    // TODO: дописать
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
   * @method OldTicketDescription
   * @param {SoapAuthentication} authentication Soap authentication
   * @param {User} user User object
   * @param {string} status
   * @param {string} type
   * @returns {OldService}
   */
  OldTicketTaskDescription = async (
    authentication: SoapAuthentication,
    user: User,
    status: string,
    type: string,
  ): Promise<OldService> => {
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
