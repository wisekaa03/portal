/** @format */

// #region Imports NPM
import { Injectable, HttpService } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import {
  OldService,
  OldTicketNewInput,
  OldTicketNew,
  OldTicket,
  OldUser,
  OldFile,
  OldTicketEditInput,
  OldServices,
  OldTickets,
  WhereService,
} from '@lib/types';
import { LogService } from '@app/logger';
import { ConfigService } from '@app/config/config.service';
import clearHtml from '@lib/clear-html';
import { SoapService, SoapFault, SoapError, SoapAuthentication } from '@app/soap';
import { constructUploads } from '@back/shared/upload';
// #endregion

export interface Attaches1CFile {
  NFile: string;
  DFile: string;
}

export interface Attaches1C {
  Вложение: Attaches1CFile[];
}

const createUser = (user: any): OldUser | null => {
  if (user) {
    return {
      name: user['ФИО'],
      avatar: user['Аватар'] || '',
      email: user['ОсновнойEmail'],
      telephone: user['ОсновнойТелефон'],
      company: user['Организация'],
      department: user['Подразделение'] ? user['Подразделение'].split(', ')[0] : '',
      otdel: user['Подразделение'] ? user['Подразделение'].split(', ')[1] : '',
      position: user['Должность'],
    };
  }

  return null;
};

const createFiles = (files: any): OldFile[] | [] => {
  if (files) {
    const newFiles = Array.isArray(files) ? files : [files];

    return newFiles
      .filter((file) => file['Код'])
      .map((file) => ({
        code: file['Код'],
        name: file['Наименование'],
        ext: file['РасширениеФайла'],
      }));
  }

  return [];
};

const createTicket = (ticket: any): OldTicket => ({
  where: WhereService.Svc1C,
  code: ticket['Код'],
  name: ticket['Наименование'],
  description: clearHtml(ticket['Описание']),
  descriptionFull: ticket['ОписаниеФД'],
  status: ticket['Статус'],
  createdDate: ticket['Дата'],
  timeout: ticket['СрокИсполнения'],
  endDate: ticket['ДатаЗавершения'],
  executorUser: createUser(ticket['ТекущийИсполнитель']),
  initiatorUser: createUser(ticket['Инициатор']),
  service: {
    where: WhereService.Svc1C,
    code: ticket['Услуга']?.['Код'] || '',
    name: ticket['Услуга']?.['Наименование'] || '',
    avatar: ticket['Услуга']?.['Аватар'] || '',
  },
  files: createFiles(ticket['СписокФайлов']?.['Файл'] || undefined),
});

@Injectable()
export class OldTicketService {
  private service: OldService[];

  constructor(
    private readonly logger: LogService,
    private readonly configService: ConfigService,
    private readonly soapService: SoapService,
    private readonly httpService: HttpService,
  ) {
    logger.setContext(OldTicketService.name);
  }

  /**
   * Ticket get service and categories
   *
   * @async
   * @method OldTicketService
   * @param {SoapAuthentication} authentication Soap authentication
   * @returns {OldService[]} Services and Categories
   */
  OldTicketService = async (authentication: SoapAuthentication, find: string): Promise<OldServices[]> => {
    const promises: Promise<OldServices>[] = [];

    if (!!this.configService.get<string>('SOAP_URL')) {
      const client = await this.soapService.connect(authentication).catch((error) => {
        promises.push(Promise.resolve({ error: JSON.stringify(error) }));
      });

      if (client) {
        promises.push(
          client
            .kngk_GetServicesAsync({ log: authentication.username, find })
            .then((result: any) => {
              this.logger.verbose(`OldTicketService: [Request] ${client.lastRequest}`);

              if (
                result &&
                result[0] &&
                result[0]['return'] &&
                typeof result[0]['return']['ЭлементСоставаУслуги'] === 'object'
              ) {
                return {
                  services: [
                    ...result[0]['return']['ЭлементСоставаУслуги']?.map((service: Record<string, any>) => ({
                      where: WhereService.Svc1C,
                      code: service['Код'],
                      name: service['Наименование'],
                      description: service['ОписаниеФД'],
                      group: service['Группа'],
                      avatar: service['Аватар'],
                    })),
                  ],
                };
              }

              return {};
            })
            .catch((error: SoapFault) => {
              this.logger.verbose(`OldTicketService: [Request] ${client.lastRequest}`);
              this.logger.verbose(`OldTicketService: [Response] ${client.lastResponse}`);

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
                return {
                  services: [
                    ...response.data?.map((service: Record<string, any>) => ({
                      where: WhereService.SvcOSTicket,
                      code: `${key}-${service['Код']}`,
                      name: service['Наименование'],
                      description: service['descr'],
                      group: service['group'],
                      avatar: service['avatar'],
                    })),
                  ],
                } as OldServices;
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
   * Tickets list
   *
   * @async
   * @method OldTickets
   * @param {SoapAuthentication} authentication Soap authentication
   * @param {string} Status
   * @returns {OldService[]}
   */
  OldTickets = async (authentication: SoapAuthentication, Status: string): Promise<OldTickets[]> => {
    const promises: Promise<OldTickets>[] = [];

    if (!!this.configService.get<string>('SOAP_URL')) {
      const client = await this.soapService.connect(authentication).catch((error) => {
        promises.push(Promise.resolve({ error: JSON.stringify(error) }));
      });

      if (client) {
        promises.push(
          client
            .kngk_GetTaskAsync({
              log: authentication.username,
              Dept: '',
              Status,
              Executor: false,
              Alltask: false,
            })
            .then((result: any) => {
              this.logger.verbose(`OldTickets: [Request] ${client.lastRequest}`);

              if (result && result[0] && result[0]['return'] && typeof result[0]['return']['Задача'] === 'object') {
                let response = result[0]['return']['Задача'];

                if (!Array.isArray(response)) {
                  response = [response];
                }

                return {
                  tickets: response.map((ticket: any) => ({
                    where: WhereService.Svc1C,
                    code: ticket['Код'],
                    type: ticket['ТипОбращения'],
                    name: ticket['Наименование'],
                    description: clearHtml(ticket['Описание']),
                    status: ticket['Статус'],
                    createdDate: ticket['Дата'],
                    avatar: ticket['Услуга']?.['Аватар'] || '',
                  })),
                };
              }

              return {};
            })
            .catch((error: SoapFault) => {
              this.logger.verbose(`OldTickets: [Request] ${client.lastRequest}`);
              this.logger.verbose(`OldTickets: [Response] ${client.lastResponse}`);

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
          promises.push(
            Promise.resolve({
              error: `Connection to ${key} failed...`,
            }),
          );
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
   * New ticket
   *
   * @async
   * @method OldTicketNew
   * @param {SoapAuthentication} authentication Soap authentication
   * @param {OldTicketNewInput} ticket
   * @param {Promise<FileUpload>[]} attachments Attachments
   * @returns {OldTicketNew} New ticket creation
   */
  OldTicketNew = async (
    authentication: SoapAuthentication,
    ticket: OldTicketNewInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<OldTicketNew> => {
    // TODO: дописать
    const client = await this.soapService.connect(authentication).catch((error) => {
      throw error;
    });

    const Attaches: Attaches1C = { Вложение: [] };

    if (attachments) {
      await constructUploads(attachments, ({ filename, file }) =>
        Attaches['Вложение'].push({ DFile: file.toString('base64'), NFile: filename }),
      ).catch((error: Error) => {
        this.logger.error(error);

        throw error;
      });
    }

    return client
      .kngk_NewTaskAsync({
        log: authentication.username,
        Title: ticket.title,
        deskr: ticket.body,
        route: ticket.serviceId,
        category: ticket.categoryId,
        TypeOfCategory: ticket.categoryType,
        Executor: ticket.executorUser ? ticket.executorUser : '',
        NFile: '',
        DFile: '',
        Attaches,
      })
      .then((result: any) => {
        this.logger.verbose(`OldTicketNew: [Request] ${client.lastRequest}`);
        // this.logger.verbose(`OldTicketNew: [Response] ${client.lastResponse}`);

        if (result && result[0] && result[0]['return']) {
          return {
            code: result[0]['return']['Код'],
            name: result[0]['return']['Наименование'],
            requisiteSource: result[0]['return']['РеквизитИсточника'],
            category: result[0]['return']['КатегорияУслуги'],
            organization: result[0]['return']['Организация'],
            status: result[0]['return']['ТекущийСтатус'],
            createdDate: result[0]['return']['ВремяСоздания'],
          } as OldTicketNew;
        }

        return {};
      })
      .catch((error: SoapFault) => {
        this.logger.verbose(`OldTicketNew: [Request] ${client.lastRequest}`);
        this.logger.verbose(`OldTicketNew: [Response] ${client.lastResponse}`);

        this.logger.error(error);

        throw SoapError(error);
      });
  };

  /**
   * Edit ticket
   *
   * @async
   * @method OldTicketEdit
   * @param {SoapAuthentication} authentication Soap authentication
   * @returns {OldTicket} Ticket for editing
   */
  OldTicketEdit = async (
    authentication: SoapAuthentication,
    ticket: OldTicketEditInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<OldTicket> => {
    // TODO: дописать
    const client = await this.soapService.connect(authentication).catch((error) => {
      throw error;
    });

    const Attaches: Attaches1C = { Вложение: [] };

    if (attachments) {
      await constructUploads(attachments, ({ filename, file }) =>
        Attaches['Вложение'].push({ DFile: file.toString('base64'), NFile: filename }),
      ).catch((error: SoapFault) => {
        this.logger.verbose(`OldTicketEdit: [Request] ${client.lastRequest}`);
        this.logger.verbose(`OldTicketEdit: [Response] ${client.lastResponse}`);

        this.logger.error(error);

        throw SoapError(error);
      });
    }

    return client
      .kngk_EditTaskAsync({
        log: ticket.code,
        Type: ticket.type,
        NewComment: ticket.comment,
        Executor: '',
        NFile: '',
        DFile: '',
        Attaches,
        AutorComment: authentication.username,
      })
      .then((result: any) => {
        this.logger.verbose(`OldTicketEdit: [Request] ${client.lastRequest}`);
        // this.logger.verbose(`OldTicketEdit: [Response] ${client.lastResponse}`);

        if (result && result[0] && result[0]['return']) {
          return createTicket(result[0]['return']);
        }

        return {};
      })
      .catch((error: SoapFault) => {
        this.logger.verbose(`OldTicketEdit: [Request] ${client.lastRequest}`);
        this.logger.verbose(`OldTicketEdit: [Response] ${client.lastResponse}`);

        this.logger.error(error);

        throw SoapError(error);
      });
  };

  /**
   * Ticket description
   *
   * @async
   * @method OldTicketDescription
   * @param {SoapAuthentication} authentication Soap authentication
   * @param {string} status
   * @param {string} type
   * @returns {OldService}
   */
  OldTicketDescription = async (
    authentication: SoapAuthentication,
    status: string,
    type: string,
  ): Promise<OldService> => {
    const client = await this.soapService.connect(authentication).catch((error) => {
      throw error;
    });

    return client
      .kngk_GetTaskDescriptionAsync({
        log: status,
        Type: type,
      })
      .then((result: any) => {
        this.logger.verbose(`OldTicketDescription: [Request] ${client.lastRequest}`);
        // this.logger.verbose(`OldTicketDescription: [Response] ${client.lastResponse}`);

        if (result && result[0] && result[0]['return'] && typeof result[0]['return'] === 'object') {
          return createTicket(result[0]['return']);
        }

        return {};
      })
      .catch((error: SoapFault) => {
        this.logger.verbose(`OldTicketDescription: [Request] ${client.lastRequest}`);
        this.logger.verbose(`OldTicketDescription: [Response] ${client.lastResponse}`);

        this.logger.error(error);

        throw SoapError(error);
      });
  };
}
