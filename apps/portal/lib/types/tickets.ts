/** @format */
import type { FileUpload } from 'graphql-upload';

export enum TkWhere {
  SOAP1C = 'SOAP1C',
  OSTaudit = 'OSTaudit',
  OSTmedia = 'OSTmedia',
  OSThr = 'OSThr',
  Default = 'default',
}

export interface TkService {
  where: TkWhere;
  code: string;
  name: string;
  description?: string;
  route?: string;
  avatar?: string;
}

export interface TkRoute {
  id?: string;
  where: TkWhere;
  code: string;
  name: string;
  description?: string;
  avatar?: string;
  services?: TkService[];
}

export interface TkRoutes {
  routes?: TkRoute[];
  errors?: string[];
}

export interface TkRoutesInput {
  cache?: boolean;
}

export interface TkTasksInput {
  status?: string;
  find?: string;
  where?: string;
  serviceId?: string;
  routeId?: string;
  cache?: boolean;
}

export interface TkFile {
  where: TkWhere;
  id: string;
  name?: string;
  mime?: string;
  body?: string;
}

export interface TkComment {
  where: TkWhere;
  code?: string;
  date?: Date;
  authorLogin?: string;
  body?: string;
  parentCode?: string;
  files?: TkFile[];
}

export interface TkTask {
  where: TkWhere;
  id?: string;
  code: string;
  subject: string;
  smallBody?: string;
  body?: string;
  status: string;
  route?: TkRoute;
  service?: TkService;
  createdDate?: Date;
  timeoutDate?: Date;
  endDate?: Date;
  executorUser?: string;
  initiatorUser?: string;
  availableAction?: string;
  availableStages?: string;
  files?: TkFile[];
  comments?: TkComment[];
}

export interface TkUser {
  where: TkWhere;
  id?: string;
  name: string;
  login?: string;
  avatar?: string;
  email?: string;
  telephone?: string;
  company?: string;
  department?: string;
  division?: string;
  manager?: string;
  title?: string;
}

export interface TkTasks {
  users?: TkUser[];
  tasks?: TkTask[];
  errors?: string[];
}

export interface TkTaskEditInput {
  where: TkWhere;
  code: string;
  comment: string;
  attachments?: Promise<FileUpload>[];
}

export interface TkTaskDescriptionInput {
  where: TkWhere;
  code: string;
  cache?: boolean;
}

export interface TkFileInput {
  where: TkWhere;
  id: string;
}

export interface TkTaskNewInput {
  where: TkWhere;
  subject: string;
  body: string;
  route: string;
  service: string;
  executorUser?: string;
  attachments?: Promise<FileUpload>[];
}

export interface TkTaskNew {
  where: TkWhere;
  code: string;
  subject: string;
  route?: string;
  service: string;
  organization?: string;
  status?: string;
  createdDate: Date;
}

export interface TkUserOST {
  company: string;
  currentCount: string;
  email: string;
  fio: string;
  function: string;
  manager: string;
  phone: string;
  // eslint-disable-next-line camelcase
  phone_ext: string;
  subdivision: string;
  Аватар: string;
}

export interface TkEditTask {
  users?: TkUser[];
  task?: TkTask;
  errors?: string[];
}

export type RecordsOST = Record<string, Array<Record<string, Record<string, any>>>>;

/**
 * SOAP fields
 */
export interface TicketsUserSOAP {
  Ref: string;
  ФИО: string;
  Аватар: string;
  ОсновнойEmail: string;
  ОсновнойТелефон: string;
  Организация: string;
  Подразделение: string;
  РуководительНаименование: string;
  Должность: string;
}

export interface TicketsUsersSOAP {
  Пользователь?: TicketsUserSOAP[];
}

export interface TicketsServiceSOAP {
  Код: string;
  Наименование: string;
  Описание: string;
  СервисВладелец?: string;
  Аватар: string;
}

export interface TicketsServicesSOAP {
  Услуга: TicketsServiceSOAP[];
}

export interface TicketsRouteSOAP {
  Код: string;
  Наименование: string;
  Описание: string;
  Аватар: string;
  СписокУслуг?: TicketsServicesSOAP;
}

export interface TicketsSOAPGetRoutes {
  Сервис?: TicketsRouteSOAP[];
}

export interface TicketsFileSOAP {
  Ref: string;
  Наименование?: string;
  РасширениеФайла?: string;
  MIME?: string;
  ФайлХранилище?: string;
}

export interface TicketsFilesSOAP {
  Файл: TicketsFileSOAP[];
}

export interface TicketsCommentSOAP {
  Дата: Date;
  // Ref
  Автор: string;
  Текст: string;
  Код: string;
  КодРодителя: string;
  Файлы: TicketsFilesSOAP;
}

export interface TicketsCommentsSOAP {
  Комментарий: TicketsCommentSOAP[];
}

export interface TicketsTaskSOAP {
  Ref: string;
  Код: string;
  Наименование: string;
  Описание?: string;
  Статус: string;
  Дата?: Date;
  СрокИсполнения?: Date;
  ДатаЗавершения?: Date;
  ТекущийИсполнитель: string;
  Инициатор: string;
  Сервис: TicketsRouteSOAP;
  Услуга: TicketsServiceSOAP;
  ДоступноеДействие?: string;
  ДоступныеЭтапы?: string;
  Файлы?: TicketsFilesSOAP;
  Комментарии?: TicketsCommentsSOAP;
}

export interface TicketsTasksSOAP {
  Задание?: TicketsTaskSOAP[];
}

export interface TicketsSOAPGetTasks {
  Пользователи?: TicketsUsersSOAP;
  Задания?: TicketsTasksSOAP;
}

export interface TicketsSOAPGetTaskDescription {
  Пользователи?: TicketsUsersSOAP;
  Задания?: TicketsTasksSOAP;
}
