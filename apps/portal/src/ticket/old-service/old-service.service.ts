/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { SoapService, SoapError, SoapAuthentication } from '@app/soap';
import { constructUploads } from '../../shared/upload';
import {
  OldService,
  OldCategory,
  OldTicketNewInput,
  OldTicketNew,
  OldTicket,
  OldUser,
  OldFile,
  OldTicketEditInput,
} from './models/old-service.interface';
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
      avatar: user['Аватар'],
      email: user['ОсновнойEmail'],
      telephone: user['ОсновнойТелефон'],
      company: user['Организация'],
      department: user['Подразделение'].split(', ')[0],
      otdel: user['Подразделение'].split(', ')[1],
      position: user['Должность'],
    };
  }

  return null;
};

const createFiles = (files: any): OldFile[] | [] => {
  if (files) {
    const newFiles = Array.isArray(files) ? files : [files];

    return newFiles.map((file) => ({
      code: file['Код'],
      name: file['Наименование'],
      ext: file['РасширениеФайла'],
    }));
  }

  return [];
};

const createTicket = (ticket: any): OldTicket => ({
  code: ticket['Код'],
  name: ticket['Наименование'],
  description: ticket['Описание'],
  descriptionFull: ticket['ОписаниеФД'],
  status: ticket['Статус'],
  createdDate: ticket['Дата'],
  timeout: ticket['СрокИсполнения'],
  endDate: ticket['ДатаЗавершения'],
  executorUser: createUser(ticket['ТекущийИсполнитель']),
  initiatorUser: createUser(ticket['Инициатор']),
  service: {
    code: ticket['Услуга']['Код'],
    name: ticket['Услуга']['Наименование'],
    avatar: ticket['Услуга']['Аватар'],
  },
  serviceCategory: {
    code: ticket['КатегорияУслуги']['Код'],
    name: ticket['КатегорияУслуги']['Наименование'],
    avatar: ticket['КатегорияУслуги']['Аватар'],
  },
  files: createFiles(ticket['СписокФайлов']['Файл']),
});

@Injectable()
export class OldTicketService {
  private service: OldService[];

  constructor(private readonly logService: LogService, private readonly soapService: SoapService) {}

  /**
   * Ticket get service and categories
   *
   * @returns {OldService[]} - Services and Categories
   */
  OldTicketService = async (authentication: SoapAuthentication): Promise<OldService[]> => {
    const client = await this.soapService.connect(authentication).catch((error) => {
      throw error;
    });

    this.service = await client
      .kngk_GetRoutesAsync({ log: authentication.username })
      .then((result: any) => {
        if (result && result[0] && result[0]['return'] && typeof result[0]['return']['Услуга'] === 'object') {
          return result[0]['return']['Услуга'].map(
            (service: any) =>
              ({
                code: service['Код'],
                name: service['Наименование'],
                description: service['ОписаниеФД'],
                group: service['Группа'],
                avatar: service['Аватар'],
                category: service['СоставУслуги']['ЭлементСоставаУслуги'].map(
                  (category: any) =>
                    ({
                      code: category['Код'],
                      name: category['Наименование'],
                      description: category['ОписаниеФД'],
                      avatar: category['Аватар'],
                      categoryType: category['ТипЗначенияКатегории'],
                    } as OldCategory),
                ),
              } as OldService),
          );
        }

        return [];
      })
      .catch((error: SoapError) => {
        throw error;
      });

    return this.service;
  };

  /**
   * New ticket
   *
   * @returns {OldTicketNew} - new ticket creation
   */
  OldTicketNew = async (
    authentication: SoapAuthentication,
    ticket: OldTicketNewInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<OldTicketNew> => {
    const client = await this.soapService.connect(authentication).catch((error) => {
      throw error;
    });

    const Attaches: Attaches1C = { Вложение: [] };

    if (attachments) {
      await Promise.all(
        await constructUploads(attachments, ({ filename, file }) => {
          Attaches['Вложение'].push({
            DFile: file.toString('base64'),
            NFile: filename,
          });
        }),
      ).catch((error) => {
        this.logService.error(error.message, JSON.stringify(error), 'OldTicketService');

        throw error;
      });
    }

    return client
      .kngk_NewTaskAsync({
        log: authentication.username,
        Title: ticket.title,
        deskr: ticket.body,
        route: ticket.categoryId,
        category: ticket.serviceId,
        TypeOfCategory: ticket.categoryType,
        Executor: ticket.executorUser ? ticket.executorUser : '',
        NFile: '',
        DFile: '',
        Attaches,
      })
      .then((result: any) => {
        this.logService.debug(client.lastRequest, 'OldTicketService');
        this.logService.debug(client.lastResponse, 'OldTicketService');

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
      .catch((error: SoapError) => {
        this.logService.error(client.lastRequest, JSON.stringify(error), 'OldTicketService');

        throw error;
      });
  };

  /**
   * Edit ticket
   *
   * @returns {OldTicket} - new ticket creation
   */
  OldTicketEdit = async (
    authentication: SoapAuthentication,
    ticket: OldTicketEditInput,
    attachments?: Promise<FileUpload>[],
  ): Promise<OldTicket> => {
    const client = await this.soapService.connect(authentication).catch((error) => {
      throw error;
    });

    const Attaches: Attaches1C = { Вложение: [] };

    if (attachments) {
      await Promise.all(
        await constructUploads(attachments, ({ filename, file }) => {
          Attaches['Вложение'].push({
            DFile: file.toString('base64'),
            NFile: filename,
          });
        }),
      ).catch((error) => {
        this.logService.error(error.message, JSON.stringify(error), 'OldTicketService');

        throw error;
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
        AuthorComment: authentication.username,
      })
      .then((result: any) => {
        this.logService.debug(client.lastRequest, 'OldTicketService');
        this.logService.debug(client.lastResponse, 'OldTicketService');

        if (result && result[0] && result[0]['return']) {
          return createTicket(result[0]['return']);
        }

        return {};
      })
      .catch((error: SoapError) => {
        this.logService.error(client.lastRequest, JSON.stringify(error), 'OldTicketService');

        throw error;
      });
  };

  /**
   * Ticket get all
   *
   * @returns {OldTicket[]}
   */
  OldTickets = async (authentication: SoapAuthentication, status: string): Promise<OldService[]> => {
    const client = await this.soapService.connect(authentication).catch((error) => {
      throw error;
    });

    this.service = await client
      .kngk_GetTaskAsync({
        log: authentication.username,
        Dept: '',
        Status: status,
        Executor: false,
        Alltask: false,
      })
      .then((result: any) => {
        if (result && result[0] && result[0]['return'] && typeof result[0]['return']['Задача'] === 'object') {
          let response = result[0]['return']['Задача'];

          if (!Array.isArray(response)) {
            response = [response];
          }

          return response.map(
            (ticket: any) =>
              ({
                code: ticket['Код'],
                type: ticket['ТипОбращения'],
                name: ticket['Наименование'],
                description: ticket['Описание'],
                status: ticket['Статус'],
                createdDate: ticket['Дата'],
                avatar: ticket['Услуга']['Аватар'],
              } as OldTicket),
          );
        }

        return [];
      })
      .catch((error: SoapError) => {
        throw error;
      });

    return this.service;
  };

  /**
   * Ticket get one
   *
   * @returns {OldTicket}
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
        if (result && result[0] && result[0]['return'] && typeof result[0]['return'] === 'object') {
          return createTicket(result[0]['return']);
        }

        return {};
      })
      .catch((error: SoapError) => {
        throw error;
      });
  };
}
