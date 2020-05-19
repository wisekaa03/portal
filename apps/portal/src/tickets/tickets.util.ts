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
export const whereService = (where: string | TkWhere): TkWhere => {
  switch (where) {
    case TkWhere.SOAP1C:
    case '1Citil':
      return TkWhere.SOAP1C;
    case TkWhere.OSTaudit:
    case 'auditors':
      return TkWhere.OSTaudit;
    case TkWhere.OSTmedia:
    case 'media':
      return TkWhere.OSTmedia;
    default:
      return TkWhere.Default;
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
export const userSOAP = (user: Record<string, any>, where: TkWhere): TkUser | null =>
  user && user !== null
    ? {
        where: whereService(where),
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
export const filesSOAP = (files: Record<string, any>, where: TkWhere): TkFile[] | null =>
  files && files !== null
    ? files
        // .filter((file: Record<string, any>) => file['Код'])
        .map((file: Record<string, any>) => ({
          where: whereService(where),
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
export const serviceSOAP = (service: Record<string, any>, where: TkWhere): TkService | null =>
  service && service !== null
    ? {
        where: whereService(where),
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
export const routeSOAP = (route: Record<string, any>, where: TkWhere): TkRoute | null =>
  route && route !== null
    ? {
        where: whereService(where),
        code: route['Код'],
        name: route['Наименование'],
        description: route['Описание'],
        avatar: route['Аватар'],
        services: route['СписокУслуг']?.['Услуга']?.map((service: Record<string, any>) => serviceSOAP(service, where)),
      }
    : null;

/**
 * Комментарии в представлении 1C SOAP
 */
// eslint-disable-next-line no-confusing-arrow
export const commentSOAP = (comment: Record<string, any>, where: TkWhere): TkComment | null =>
  comment && comment !== null
    ? {
        where: whereService(where),
        date: new Date(comment['Дата']),
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
export const authorCommentsSOAP = (comments: Record<string, any>, where: TkWhere): TkAuthorComments | null =>
  comments && comments !== null
    ? {
        users: comments['Авторы']?.['АвторКомментария']?.map((user: Record<string, any>) => userSOAP(user, where)),
        comments: comments['Комментарии']?.['Комментарий']?.map((comment: Record<string, any>) =>
          commentSOAP(comment, where),
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
export const taskSOAP = (task: Record<string, any>, where: TkWhere): TkTask | null =>
  task && task !== null
    ? {
        where: whereService(where),
        code: task['Код'],
        name: task['Наименование'],
        type: task['ТипОбращения'],
        description: clearHtml(task['Описание']),
        descriptionFull: task['ОписаниеФД'],
        status: task['Статус'],
        createdDate: task['Дата']?.toISOString() === '0000-12-31T21:29:43.000Z' ? null : new Date(task['Дата']),
        timeoutDate:
          task['СрокИсполнения']?.toISOString() === '0000-12-31T21:29:43.000Z'
            ? null
            : new Date(task['СрокИсполнения']),
        endDate:
          task['ДатаЗавершения']?.toISOString() === '0000-12-31T21:29:43.000Z'
            ? null
            : new Date(task['ДатаЗавершения']),
        executorUser: userSOAP(task['ТекущийИсполнитель'], where),
        initiatorUser: userSOAP(task['Инициатор'], where),
        route: routeSOAP(task['Сервис'], where),
        service: serviceSOAP(task['Услуга'], where),
        availableAction: task['ДоступноеДействие'],
        availableStages: task['ДоступныеЭтапы'],
        files: filesSOAP(task['СписокФайлов']?.['Файл'], where),
        comments: authorCommentsSOAP(task['КомментарииЗадачи'], where),
      }
    : null;

export const filesOST = (files: any, where: TkWhere): TkFile[] => {
  if (files) {
    const filesArray = Array.isArray(files) ? files : [files];

    return filesArray
      .filter((file) => file['Код'])
      .map((file) => ({
        where: whereService(where),
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
export const serviceOST = (service: Record<string, any>, where: TkWhere): TkService | null =>
  service && service !== null
    ? {
        where: whereService(where),
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
export const routesOST = (route: Record<string, any>, where: TkWhere): TkRoute | null =>
  route && route !== null
    ? {
        where: whereService(where),
        code: route['code'],
        name: route['name'],
        description: route['description'],
        avatar: route['avatar'],
        services: route['services']?.map((service: Record<string, any>) => serviceOST(service, where)),
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
export const taskOST = (task: Record<string, any>, where: TkWhere): TkTask | null =>
  task && task !== null
    ? {
        where: whereService(where),
        type: undefined,
        code: task['number'],
        name: task['subject'],
        description: task['description'],
        descriptionFull: undefined,
        status: task['status_name'],
        createdDate: task['created'],
        timeoutDate: null,
        endDate: null,
        initiatorUser: {
          where: whereService(where),
          name: task['user_name'],
        },
        executorUser: {
          where: whereService(where),
          name: task['assignee_user_name'],
        },
        service: {
          where: whereService(where),
          code: '',
          name: task['topic'],
        },
        availableAction: undefined,
        availableStages: undefined,
        files: filesOST(task['files']?.['file'], where),
        comments: null,
      }
    : null;
