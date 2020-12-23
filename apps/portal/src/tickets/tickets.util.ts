/** @format */
/* eslint no-confusing-arrow:0 */

import clearHtml from '@lib/clear-html';
import type {
  TicketsTaskSOAP,
  TicketsCommentSOAP,
  TicketsFileSOAP,
  TicketsRouteSOAP,
  TicketsServiceSOAP,
  TicketsUserSOAP,
} from '@back/shared/types';
import { SOAP_DATE_NULL } from '@back/shared/constants';
import { TkWhere, TkTaskNew, TkRoute, TkService, TkTask, TkUser, TkFile, TkComment } from './graphql';

export const SMALL_BODY_STRING = 250;

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
export const whereService = (where?: string | TkWhere): TkWhere => {
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
    case TkWhere.OSThr:
    case 'kadry':
      return TkWhere.OSThr;
    default:
      return TkWhere.Default;
  }
};

/** *******************************************************************************************
 * SOAP1C
 */

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
export const userSOAP = (user: TicketsUserSOAP, where?: TkWhere): TkUser | undefined =>
  user && Object.keys(user).length > 0
    ? {
        id: `${whereService(where)}:${user.Ref || user['ФИО']}`,
        where: whereService(where),
        code: user.Ref || user['ФИО'] || '-',
        name: user['ФИО'] || '-',
        login: user['ФИО'],
        avatar: user['Аватар'] || '',
        email: user['ОсновнойEmail'],
        telephone: user['ОсновнойТелефон'],
        company: user['Организация'],
        department: user['Подразделение']?.split(', ')[0],
        division: user['Подразделение']?.split(', ')[1],
        manager: user['РуководительНаименование'],
        title: user['Должность'],
      }
    : undefined;

export const fileSOAP = (file: TicketsFileSOAP, where?: TkWhere): TkFile | undefined =>
  file && Object.keys(file).length > 0 && file['Наименование']
    ? {
        id: `${whereService(where)}:${file.Ref}`,
        where: whereService(where),
        code: file.Ref,
        name: file['Наименование']
          ? file['РасширениеФайла']
            ? `${file['Наименование']}.${file['РасширениеФайла']}`
            : file['Наименование']
          : undefined,
        mime: file.MIME,
        body: file['ФайлХранилище'],
      }
    : undefined;

/**
 * Услуга в представлении 1C SOAP:
 * - Код
 * - Наименование
 * - Описание
 * - СервисВладелец - Сервис (route) которому принадлежит данная услуга
 * - Аватар
 */
export const serviceSOAP = (service: TicketsServiceSOAP, where?: TkWhere): TkService | undefined =>
  service && Object.keys(service).length > 0 && !(service['Код'] === '' && service['Наименование'] === '' && service['Описание'] === '')
    ? {
        id: `${whereService(where)}:${service['Код']}`,
        where: whereService(where),
        code: service['Код'],
        name: service['Наименование'],
        description: service['Описание'],
        route: service['СервисВладелец'],
        avatar: service['Аватар'],
      }
    : undefined;

/**
 * Сервис в представлении 1C SOAP:
 * - Код
 * - Наименование
 * - Описание
 * - Аватар
 */
export const routeSOAP = (route: TicketsRouteSOAP, where?: TkWhere): TkRoute | undefined =>
  route && Object.keys(route).length > 0 && !(route['Код'] === '' && route['Наименование'] === '' && route['Описание'] === '')
    ? {
        id: `${whereService(where)}:${route['Код']}`,
        where: whereService(where),
        code: route['Код'],
        name: route['Наименование'],
        description: route['Описание'],
        avatar: route['Аватар'],
        services:
          route['СписокУслуг']?.['Услуга'] && Array.isArray(route['СписокУслуг']['Услуга'])
            ? route['СписокУслуг']['Услуга'].reduce((accumulator: TkService[], element) => {
                const service = serviceSOAP(element, where);
                if (service) {
                  return [...accumulator, service];
                }
                return accumulator;
              }, [] as TkService[])
            : undefined,
      }
    : undefined;

/**
 * Комментарии в представлении 1C SOAP
 */
export const commentSOAP = (comment: TicketsCommentSOAP, where?: TkWhere): TkComment | undefined =>
  comment && Object.keys(comment).length > 0
    ? {
        id: `${whereService(where)}:${comment['Код']}`,
        where: whereService(where),
        code: comment['Код'],
        date: comment['Дата'],
        authorLogin: comment['Автор'],
        body: comment['Текст'],
        parentCode: comment['КодРодителя'],
        files:
          comment['Файлы']?.['Файл'] && Array.isArray(comment['Файлы']['Файл'])
            ? comment['Файлы']['Файл'].reduce((accumulator: TkFile[], element) => {
                const file = fileSOAP(element, where);
                if (file) {
                  return [...accumulator, file];
                }
                return accumulator;
              }, [] as TkFile[])
            : undefined,
      }
    : undefined;

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
export const taskSOAP = (task: TicketsTaskSOAP, where?: TkWhere): TkTask | undefined =>
  task && Object.keys(task).length > 0
    ? {
        id: `${whereService(where)}:${task.Ref || task['Код']}`,
        where: whereService(where),
        code: task['Код'],
        subject: task['Наименование'],
        body: task['Описание'] ? clearHtml(task['Описание'] || '') : undefined,
        smallBody: task['Описание'] ? clearHtml(task['Описание'] || '', SMALL_BODY_STRING) : undefined,
        status: task['Статус'],
        createdDate: !task['Дата'] || task['Дата']?.toISOString() === SOAP_DATE_NULL ? undefined : task['Дата'],
        timeoutDate:
          !task['СрокИсполнения'] || task['СрокИсполнения']?.toISOString() === SOAP_DATE_NULL ? undefined : task['СрокИсполнения'],
        endDate: !task['ДатаЗавершения'] || task['ДатаЗавершения']?.toISOString() === SOAP_DATE_NULL ? undefined : task['ДатаЗавершения'],
        executorUser: task['ТекущийИсполнитель'],
        initiatorUser: task['Инициатор'],
        route: routeSOAP(task['Сервис'], where),
        service: serviceSOAP(task['Услуга'], where),
        availableAction: task['ДоступноеДействие'],
        availableStages: task['ДоступныеЭтапы'],
        files:
          task['Файлы']?.['Файл'] && Array.isArray(task['Файлы']['Файл'])
            ? task['Файлы']['Файл'].reduce((accumulator: TkFile[], element) => {
                const file = fileSOAP(element, where);
                if (file) {
                  return [...accumulator, file];
                }
                return accumulator;
              }, [] as TkFile[])
            : undefined,
        comments:
          task['Комментарии']?.['Комментарий'] && Array.isArray(task['Комментарии']['Комментарий'])
            ? task['Комментарии']['Комментарий'].reduce((accumulator: TkComment[], element) => {
                const comment = commentSOAP(element, where);
                if (comment) {
                  return [...accumulator, comment];
                }
                return accumulator;
              }, [] as TkComment[])
            : undefined,
      }
    : undefined;

/** *******************************************************************************************
 * OSTicket
 */

/**
 * Файлы в представлении OSTicket:
 * - Код
 * - Наименование
 * - РасширениеФайла
 */
export const filesOST = (files: Record<string, any>, where?: TkWhere): TkFile[] => {
  if (files) {
    const filesArray = Array.isArray(files) ? files : [files];

    return filesArray
      .filter((file) => file['Код'])
      .map((file) => ({
        id: `${whereService(where)}:${file['Код']}`,
        where: whereService(where),
        code: file['Код'],
        name: file['Наименование'],
        ext: file['РасширениеФайла'],
        mime: undefined,
        body: file['Файл'],
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
export const serviceOST = (service: Record<string, any>, where: TkWhere): TkService | undefined =>
  service && Object.keys(service).length > 0
    ? {
        id: `${whereService(where)}:${service.code}`,
        where: whereService(where),
        code: service.code,
        name: service.name,
        description: service.description,
        route: undefined,
        avatar: service.avatar,
      }
    : undefined;

/**
 * Сервис в представлении OSTicket:
 * - Код
 * - Наименование
 * - descr
 * - group - ?
 * - avatar
 */
export const routesOST = (route: Record<string, any>, where: TkWhere): TkRoute | undefined =>
  route && Object.keys(route).length > 0
    ? {
        id: `${whereService(where)}:${route.code}`,
        where: whereService(where),
        code: route.code,
        name: route.name,
        description: route.description,
        avatar: route.avatar,
        services: route.services?.map((service: Record<string, any>) => serviceOST(service, where)),
      }
    : undefined;

/**
 * Описание в представлении OSTicket:
 */
export const commentsOST = (comments: Record<string, any>, where: TkWhere, task: string): TkComment[] | undefined => [];
// comments && Array.isArray(comments)
//   ? comments.reduce(
//       (accumulator: TkComment[], comment: Record<string, any>) => {
//         return {
//           users: accumulator.users?.concat([
//             {
//               where: whereService(where),
//               name: comment['user'],
//               login: comment['user'],
//               email: comment['email'],
//             },
//           ]),
//           comments: accumulator.comments?.concat([
//             {
//               where: whereService(where),
//               date: new Date(comment['created']),
//               body: comment['body'],
//               code: comment['id'],
//               parentCode: '',
//               authorLogin: comment['user'],
//               files: [
//                 ...comment['attachments']?.map((file: Record<string, any>) => ({
//                   code: file['code'],
//                   name: file['name'],
//                   mime: file['mime'],
//                   body: file['body'],
//                 })),
//               ],
//             },
//           ]),
//         };
//       },
//       { users: [], comments: [] },
//     )
//   : undefined;

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
export const taskOST = (task: Record<string, any>, where: TkWhere): TkTask | undefined =>
  task && Object.keys(task).length > 0
    ? {
        id: `${whereService(where)}:${task.number}`,
        where: whereService(where),
        code: task.number,
        subject: task.subject,
        smallBody:
          typeof task.description === 'string'
            ? task.description?.substring(0, SMALL_BODY_STRING)
            : task.description?.[0]?.body?.substring(0, SMALL_BODY_STRING),
        body: typeof task.description === 'string' ? task.description : task.description?.[0]?.body,
        status: task.status_name,
        createdDate: new Date(task.created),
        timeoutDate: new Date(task.dateOfCompletion),
        endDate: undefined,
        initiatorUser: task.owner_user_id ? `${whereService(where)}.${task.owner_user_id}` : undefined,
        executorUser: task.assignee_user_id ? `${whereService(where)}.${task.assignee_user_id}` : undefined,
        route: {
          id: `${whereService(where)}.${task.route?.code}`,
          where: whereService(where),
          code: task.route?.code,
          description: '',
          avatar: task.route?.avatar,
          name: task.route?.name,
          services: undefined,
        },
        service: {
          id: `${whereService(where)}.${task.topic_id}`,
          where: whereService(where),
          code: task.topic_id,
          description: '',
          avatar: task.topic_avatar,
          route: undefined,
          name: task.topic,
        },
        availableAction: undefined,
        availableStages: undefined,
        files: undefined,
        comments: commentsOST(task.description, where, task.number),
      }
    : undefined;

/**
 * Новая задача в представлении OSTicket:
 * - number: Код
 * - name - Наименование
 * - route - Сервис
 * - service - Услуга
 * - company - Компания
 * - status - Статус
 * - creationDateTime - Дата создания
 */
export const newOST = (task: Record<string, any>, where?: TkWhere): TkTaskNew | undefined =>
  task && Object.keys(task).length > 0
    ? {
        // id: task['ticket'],
        where: whereService(where),
        code: task.number,
        subject: task.name,
        route: task.route?.name,
        service: task.service?.name,
        organization: task.company,
        status: task.status || 'New',
        createdDate: new Date(task.creationDateTime),
      }
    : undefined;

export const descriptionOST = (task: Record<string, any>, where?: TkWhere): [TkUser[] | undefined, TkTask] => {
  const taskDescription = {
    id: `${whereService(where)}:${task.number}`,
    where: whereService(where),
    code: task.number,
    subject: task.subject,
    smallBody: task.description?.[0]?.body?.substring(0, SMALL_BODY_STRING),
    body: task.description?.[0]?.body,
    status: task.status_name,
    createdDate: new Date(task.created),
    timeoutDate: new Date(task.dateOfCompletion),
    endDate: undefined,
    initiatorUser: task.owner_user_id ? `${whereService(where)}.user.${task.owner_user_id}` : undefined,
    executorUser: task.assignee_user_id ? `${whereService(where)}.user.${task.assignee_user_id}` : undefined,
    route: {
      id: `${whereService(where)}:${task.route?.code}`,
      where: whereService(where),
      code: task.route?.code,
      name: task.route?.name,
      avatar: task.route?.avatar,
      description: '',
      services: undefined,
    },
    service: {
      id: `${whereService(where)}:${task.topic_id}`,
      where: whereService(where),
      code: task.topic_id,
      name: task.topic,
      avatar: task.topic_avatar,
      description: '',
      route: undefined,
    },
    availableAction: undefined,
    availableStages: undefined,
    comments: undefined,
    files:
      typeof task.description?.[0]?.attachments === 'object'
        ? task.description?.[0]?.attachments.map((att: Record<string, string>) => ({
            id: `${whereService(where)}:${att.code}`,
            where: whereService(where),
            code: att.code,
            mime: att.mime,
            body: att.body,
            name: att.name,
          }))
        : undefined,
  };

  const users = [
    {
      id: task.owner_user_id ? `${whereService(where)}:user.${task.owner_user_id}` : `${whereService(where)}:user.unknown`,
      where: whereService(where),
      code: `user.${task.owner_user_id}`,
      name: task.owner_user_name,
      avatar: task.owner_avatar,
      email: task.owner_email,
      telephone: task.owner_phone,
      company: task.owner_company,
      login: undefined,
    } as TkUser,
  ];
  if (task.assignee_user_name) {
    users.push({
      id: task.assignee_user_id ? `${whereService(where)}:user.${task.assignee_user_id}` : `${whereService(where)}:user.unknown`,
      where: whereService(where),
      code: `user.${task.assignee_user_id}`,
      name: task.assignee_user_name,
      avatar: task.assignee_avatar,
      email: task.assignee_email,
      telephone: task.assignee_phone,
      company: task.assignee_company,
      login: undefined,
    } as TkUser);
  }

  return [users, taskDescription];
};

/**
 * Новый user в представлении OSTicket:
 */
export const userOST = (user: Record<string, any>, where: TkWhere): TkUser | undefined =>
  user && Object.keys(user).length > 0
    ? {
        id: user.Ref || user['ФИО'] ? `${whereService(where)}:user.${user['ФИО']}` : `${whereService(where)}:user.unknown`,
        where: whereService(where),
        code: user.Ref || `user.${user['ФИО']}` || 'user.unknown',
        name: user['ФИО'],
        avatar: user['Аватар'],
        email: user['ОсновнойEmail'],
        telephone: user['ОсновнойТелефон'],
        company: user['Организация'],
        department: user['Подразделение']?.split(', ')[0],
        division: user['Подразделение']?.split(', ')[1],
        manager: user['РуководительНаименование'],
        title: user['Должность'],
        login: undefined,
      }
    : undefined;
