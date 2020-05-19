/** @format */

import { TkWhere, TkRoute, TkService, TkTask, TkUser, TkFile, TkAuthorComments, TkComment } from '@lib/types';
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

// eslint-disable-next-line no-confusing-arrow
export const filesSOAP = (files: Record<string, any>, key: string): TkFile[] | null =>
  files && files !== null
    ? files
        // .filter((file: Record<string, any>) => file['Код'])
        .map((file: Record<string, any>) => ({
          where: whereService(key),
          code: file['Код'],
          name: file['Наименование'],
          ext: file['РасширениеФайла'],
        }))
    : null;

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
export const routeSOAP = (route: Record<string, any>, key: string): TkRoute | null =>
  route && route !== null
    ? {
        where: whereService(key),
        code: route['Код'],
        name: route['Наименование'],
        description: route['Описание'],
        avatar: route['Аватар'],
        services: route['СписокУслуг']?.['Услуга']?.map((service: Record<string, any>) => serviceSOAP(service, key)),
      }
    : null;

/**
 * Комментарии в представлении 1C SOAP
 */
// eslint-disable-next-line no-confusing-arrow
export const commentSOAP = (comment: Record<string, any>, key: string): TkComment | null =>
  comment && comment !== null
    ? {
        where: whereService(key),
        date: comment['Дата'],
        authorLogin: comment['ЛогинАвтора'],
        body: comment['Текст'],
        task: comment['Владелец'],
        code: comment['Код'],
        parentCode: comment['КодРодителя'],
      }
    : null;

/**
 * АвторКомментария и Комментарии в представлении 1C SOAP
 */
// eslint-disable-next-line no-confusing-arrow
export const authorCommentsSOAP = (comments: Record<string, any>, key: string): TkAuthorComments | null =>
  comments && comments !== null
    ? {
        users: comments['Авторы']?.['АвторКомментария']?.map((user: Record<string, any>) => userSOAP(user, key)),
        comments: comments['Комментарии']?.['Комментарий']?.map((comment: Record<string, any>) =>
          commentSOAP(comment, key),
        ),
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
        type: task['ТипОбращения'],
        description: clearHtml(task['Описание']),
        descriptionFull: task['ОписаниеФД'],
        status: task['Статус'],
        createdDate: task['Дата']?.toISOString() === '0000-12-31T21:29:43.000Z' ? null : task['Дата'],
        timeoutDate:
          task['СрокИсполнения']?.toISOString() === '0000-12-31T21:29:43.000Z' ? null : task['СрокИсполнения'],
        endDate: task['ДатаЗавершения']?.toISOString() === '0000-12-31T21:29:43.000Z' ? null : task['ДатаЗавершения'],
        executorUser: userSOAP(task['ТекущийИсполнитель'], key),
        initiatorUser: userSOAP(task['Инициатор'], key),
        route: routeSOAP(task['Сервис'], key),
        service: serviceSOAP(task['Услуга'], key),
        availableAction: task['ДоступноеДействие'],
        availableStages: task['ДоступныеЭтапы'],
        files: filesSOAP(task['СписокФайлов']?.['Файл'], key),
        comments: authorCommentsSOAP(task['КомментарииЗадачи'], key),
      }
    : null;

export const filesOST = (files: any, key: string): TkFile[] => {
  if (files) {
    const filesArray = Array.isArray(files) ? files : [files];

    return filesArray
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
        type: undefined,
        code: task['number'],
        name: task['subject'],
        description: task['description'],
        descriptionFull: undefined,
        status: task['status_name'],
        createdDate: task['created'],
        timeoutDate: undefined,
        endDate: undefined,
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
        availableAction: undefined,
        availableStages: undefined,
        files: filesOST(task['files']?.['file'], key),
        comments: null,
      }
    : null;
