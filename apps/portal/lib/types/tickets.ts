/** @format */
import { FileUpload } from 'graphql-upload';

export enum TkWhere {
  SOAP1C = 'SOAP1C',
  OSTaudit = 'OSTaudit',
  OSTmedia = 'OSTmedia',
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

export interface TkFile {
  where: TkWhere;
  code: string;
  name: string;
  ext?: string;
  mime?: string;
  body?: string;
}

export interface TkComment {
  where: TkWhere;
  date: Date;
  authorLogin: string;
  body: string;
  task: string;
  code: string;
  parentCode: string;
  files?: TkFile[];
}

export interface TkAuthorComments {
  users?: TkUser[];
  comments?: TkComment[];
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
  comments?: TkAuthorComments;
}

export interface TkTasks {
  users?: TkUser[];
  tasks?: TkTask[];
  errors?: string[];
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

export interface TkTaskEditInput {
  where: TkWhere;
  code: string;
  comment: string;
  attachments?: Promise<FileUpload>[];
}

export interface TkTaskDescriptionInput {
  where: TkWhere;
  code: string;
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
