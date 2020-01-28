/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
import { FileUpload } from 'graphql-upload';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { SoapService, SOAPClient, SoapAuthentication } from '@app/soap';
import { OldService, OldCategory, OldTicketNewInput, OldTicketNew } from './models/old-service.interface';
// #endregion

@Injectable()
export class TicketOldService {
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
      .catch((error: Error) => {
        throw error;
      });

    return this.service;
  };

  /**
   * New ticket
   *
   * @returns {OldTicketNew} - new ticket creation
   */
  OldTicketNew = async (authentication: SoapAuthentication, ticket: OldTicketNewInput): Promise<OldTicketNew> => {
    const client = await this.soapService.connect(authentication).catch((error) => {
      throw error;
    });

    if (ticket.attachments) {
      // eslint-disable-next-line no-debugger
      debugger;

      ticket.attachments.forEach(async (attach: FileUpload) => {
        const { filename, mimetype, createReadStream } = await attach;

        // eslint-disable-next-line no-debugger
        debugger;
      });
    }

    return client
      .kngk_NewTaskAsync({
        log: authentication.username,
        Title: ticket.title,
        descr: ticket.body,
        route: ticket.categoryId,
        category: ticket.serviceId,
        TypeOfCategory: ticket.categoryType,
        Executor: ticket.executorUser,
      })
      .then((result: any) => {
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

        return [];
      })
      .catch((error: Error) => {
        throw error;
      });
  };
}
