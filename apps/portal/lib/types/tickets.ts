/** @format */
import { FileUpload } from 'graphql-upload';

export enum TkWhere {
  Svc1Citil = '1Citil',
  SvcOSTaudit = 'OSTaudit',
  SvcOSTmedia = 'OSTmedia',
  SvcDefault = 'default',
}

export interface TkService {
  where: TkWhere;
  code: string;
  name: string;
  description?: string;
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
  categories?: (TkRoute | null)[];
  error?: string;
}

export interface TkFile {
  where: TkWhere;
  code: string;
  name: string;
  ext?: string;
}

export interface TkTask {
  where: TkWhere;
  code: string;
  name: string;
  type?: string;
  description?: string;
  descriptionFull?: string;
  status?: string;
  service: TkService | null;
  createdDate?: string;
  endDate?: string;
  executorUser: TkUser | null;
  initiatorUser: TkUser | null;
  files?: TkFile[];
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
  serviceId: string;
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
