/** @format */

import { TkWhere, TkRoute, TkService, TkTask, TkUser, TkFile } from '@lib/types';
import clearHtml from '@lib/clear-html';

export interface AttachesSOAPFile {
  NFile: string;
  DFile: string;
}

export interface AttachesSOAP {
  Вложение: AttachesSOAPFile[];
}

/**
 * На какой сервис отправлять сообщения.
 */
export const whereService = (key: string | keyof TkWhere): TkWhere => {
  switch (key) {
    case '1Citil' || TkWhere.Svc1Citil:
      return TkWhere.Svc1Citil;
    case 'auditors' || TkWhere.SvcOSTaudit:
      return TkWhere.SvcOSTaudit;
    case 'media' || TkWhere.SvcOSTmedia:
      return TkWhere.SvcOSTmedia;
    default:
      return TkWhere.SvcDefault;
  }
};

/**
 * User в представлении 1C SOAP:
 * - ФИО
 * - Аватар
 * - ОсновнойEmail
 * - ОсновнойТелефон
 * - Организация
 * - Подразделение
 * - Должность
 * - РуководительНаименование
 * - КоличествоАктивных - ?
 * - Логин
 * - КаналТелефонии
 */
// eslint-disable-next-line no-confusing-arrow
export const userSOAP = (user: Record<string, any>, key: string): TkUser | null =>
  user && user !== null
    ? {
        where: whereService(key),
        name: user['ФИО'],
        avatar: user['Аватар'] || '',
        email: user['ОсновнойEmail'],
        telephone: user['ОсновнойТелефон'],
        company: user['Организация'],
        department: user['Подразделение'] ? user['Подразделение'].split(', ')[0] : '',
        division: user['Подразделение'] ? user['Подразделение'].split(', ')[1] : '',
        title: user['Должность'],
      }
    : null;

export const filesSOAP = (files: any, key: string): TkFile[] | [] => {
  if (files) {
    const newFiles = Array.isArray(files) ? files : [files];

    return newFiles
      .filter((file) => file['Код'])
      .map((file) => ({
        where: whereService(key),
        code: file['Код'],
        name: file['Наименование'],
        ext: file['РасширениеФайла'],
      }));
  }

  return [];
};

/**
 * Услуга в представлении 1C SOAP:
 * - Код
 * - Наименование
 * - Описание
 * - СервисВладелец - ?
 * - Аватар
 */
// eslint-disable-next-line no-confusing-arrow
export const serviceSOAP = (service: Record<string, any>, key: string): TkService | null =>
  service && service !== null
    ? {
        where: whereService(key),
        code: service['Код'],
        name: service['Наименование'],
        description: service['Описание'],
        route: service['СервисВладелец'],
        avatar: service['Аватар'],
      }
    : null;

/**
 * Сервис в представлении 1C SOAP:
 * - Код
 * - Наименование
 * - Описание
 * - Аватар
 */
// eslint-disable-next-line no-confusing-arrow
export const routesSOAP = (route: Record<string, any>, key: string): TkRoute | null =>
  route && route !== null
    ? {
        where: whereService(key),
        code: route['Код'],
        name: route['Наименование'],
        description: route['Описание'],
        avatar: route['Аватар'],
        services: route['Услуга']?.map((service: Record<string, any>) => serviceSOAP(service, key)),
      }
    : null;

/**
 * Задача в представлении 1C SOAP:
 * - ТипОбращения
 * - Код
 * - Наименование
 * - Описание
 * - Статус
 * - СрокИсполнения
 * - ДатаЗавершения
 * - ТекущийИсполнитель
 * - Инициатор
 * - Сервис - ?
 * - Услуга
 */
// eslint-disable-next-line no-confusing-arrow
export const taskSOAP = (task: Record<string, any>, key: string): TkTask | null =>
  task && task !== null
    ? {
        where: whereService(key),
        code: task['Код'],
        name: task['Наименование'],
        description: clearHtml(task['Описание']),
        descriptionFull: task['ОписаниеФД'],
        status: task['Статус'],
        createdDate: task['Дата'],
        // timeout: ticket['СрокИсполнения'],
        endDate: task['ДатаЗавершения'],
        executorUser: userSOAP(task['ТекущийИсполнитель'], key),
        initiatorUser: userSOAP(task['Инициатор'], key),
        service: serviceSOAP(task['Услуга'], key),
        files: filesSOAP(task['СписокФайлов']?.['Файл'] || undefined, key),
      }
    : null;

/**
 * Услуга в представлении OSTicket:
 * - Код
 * - Наименование
 * - descr
 * - group - ?
 * - avatar
 */
// eslint-disable-next-line no-confusing-arrow
export const serviceOST = (service: Record<string, any>, key: string): TkService | null =>
  service && service !== null
    ? {
        where: whereService(key),
        code: service['code'],
        name: service['name'],
        description: service['description'],
        avatar: service['avatar'],
      }
    : null;

/**
 * Сервис в представлении OSTicket:
 * - Код
 * - Наименование
 * - descr
 * - group - ?
 * - avatar
 */
// eslint-disable-next-line no-confusing-arrow
export const routesOST = (route: Record<string, any>, key: string): TkRoute | null =>
  route && route !== null
    ? {
        where: whereService(key),
        code: route['code'],
        name: route['name'],
        description: route['description'],
        avatar: route['avatar'],
        services: route['services']?.map((service: Record<string, any>) => serviceOST(service, key)),
      }
    : null;

/**
 * Задача в представлении OSTicket:
 * - number: Код
 * - subject - Наименование
 * - description - Описание
 * - status - Статус
 * - created - Дата создания
 * - user_name - Кто создал заявку
 * - assignee_user_name - Исполнитель
 * - topic - Услуга
 * - ТекущийИсполнитель
 * - Инициатор
 * - Сервис - ?
 * - Услуга
 */
// eslint-disable-next-line no-confusing-arrow
export const taskOST = (task: Record<string, any>, key: string): TkTask | null =>
  task && task !== null
    ? {
        where: whereService(key),
        code: task['number'],
        name: task['subject'],
        description: task['description'],
        status: task['status_name'],
        createdDate: task['created'],
        // timeout: ticket['СрокИсполнения'],
        // endDate: task['ДатаЗавершения'],
        initiatorUser: {
          where: whereService(key),
          name: task['user_name'],
        },
        executorUser: {
          where: whereService(key),
          name: task['assignee_user_name'],
        },
        service: {
          where: whereService(key),
          code: '',
          name: task['topic'],
        },
        // files: filesSOAP(task['СписокФайлов']?.['Файл'] || undefined, key),
      }
    : null;
