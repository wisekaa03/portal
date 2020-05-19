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
  services?: (TkService | null)[];
}

export interface TkRoutes {
  routes?: (TkRoute | null)[];
  error?: string;
}

export interface TkFile {
  where: TkWhere;
  code: string;
  name: string;
  ext?: string;
}

export interface TkComment {
  where: TkWhere;
  date: string;
  authorLogin: string;
  body: string;
  task: string;
  code: string;
  parentCode: string;
}

export interface TkAuthorComments {
  users: TkUser[] | null;
  comments: TkComment[] | null;
}

export interface TkTask {
  where: TkWhere;
  code: string;
  name: string;
  type?: string;
  description?: string;
  descriptionFull?: string;
  status?: string;
  route?: TkService | null;
  service: TkService | null;
  createdDate?: string;
  timeoutDate?: string;
  endDate?: string;
  executorUser: TkUser | null;
  initiatorUser: TkUser | null;
  availableAction?: string;
  availableStages?: string;
  files: TkFile[] | null;
  comments: TkAuthorComments | null;
}

export interface TkTasks {
  tasks?: (TkTask | null)[];
  error?: string;
}

export interface TkUser {
  where: TkWhere;
  name: string;
  avatar?: string;
  email?: string;
  telephone?: string;
  company?: string;
  department?: string;
  division?: string;
  title?: string;
}

export interface TkTaskNewInput {
  where: TkWhere;
  title: string;
  body: string;
  service: string;
  executorUser?: string;
  attachments?: Promise<FileUpload>[];
}

export interface TkTaskEditInput {
  where: TkWhere;
  code: string;
  type: string;
  comment: string;
  attachments?: Promise<FileUpload>[];
}

export interface TkTaskDescriptionInput {
  where: TkWhere;
  code: string;
}

export interface TkTaskNew {
  error?: string;
  where?: TkWhere;
  code?: string;
  name?: string;
  requisiteSource?: string;
  category?: string;
  organization?: string;
  status?: string;
  createdDate?: Date;
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
