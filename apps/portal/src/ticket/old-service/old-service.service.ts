/** @format */

// #region Imports NPM
import { Injectable } from '@nestjs/common';
// #endregion
// #region Imports Local
import { LogService } from '@app/logger';
import { SoapService, SOAPClient, SoapAuthentication } from '@app/soap';
import { OldService, OldCategory, OldTicketNewInput, OldTicketNew } from './models/old-service.interface';
// #endregion

@Injectable()
export class TicketOldService {
  private client: SOAPClient;

  private service: OldService[];

  constructor(private readonly logService: LogService, private readonly soapService: SoapService) {}

  /**
   * Ticket get service and categories
   *
   * @returns {OldService[]} - Services and Categories
   */
  OldTicketService = async (authentication: SoapAuthentication): Promise<OldService[]> => {
    if (!this.client) {
      this.client = await this.soapService.connect(authentication).catch((error) => {
        throw error;
      });
    }

    if (this.client) {
      this.service = await this.client
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
    }

    return this.service;
  };

  /**
   * New ticket
   *
   * @returns {OldTicketNew} - new ticket creation
   */
  OldTicketNew = async (authentication: SoapAuthentication, ticket: OldTicketNewInput): Promise<OldTicketNew> => {
    if (!this.client) {
      this.client = await this.soapService.connect(authentication).catch((error) => {
        throw error;
      });
    }

    return this.client
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
  };
}
