/** @format */
import { FileUpload } from 'graphql-upload';

export enum WhereService {
  Svc1Citil = '1Citil',
  SvcOSTaudit = 'OSTaudit',
  SvcOSTmedia = 'OSTmedia',
  SvcDefault = 'default',
}

export interface OldService {
  where: WhereService;
  code: string;
  name: string;
  description?: string;
  avatar?: string;
}

export interface OldServices {
  services?: (OldService | null)[];
  error?: string;
}

export interface OldFile {
  where: WhereService;
  code: string;
  name: string;
  ext?: string;
}

export interface OldTask {
  where: WhereService;
  code: string;
  name: string;
  type?: string;
  description?: string;
  descriptionFull?: string;
  status?: string;
  service: OldService | null;
  createdDate?: string;
  endDate?: string;
  executorUser: OldUser | null;
  initiatorUser: OldUser | null;
  files?: OldFile[];
}

export interface OldTasks {
  tasks?: (OldTask | null)[];
  error?: string;
}

export interface OldUser {
  where: WhereService;
  name: string;
  avatar?: string;
  email?: string;
  telephone?: string;
  company?: string;
  department?: string;
  division?: string;
  title?: string;
}

export interface OldTicketTaskNewInput {
  where: WhereService;
  title: string;
  body: string;
  serviceId: string;
  executorUser?: string;
  attachments?: Promise<FileUpload>[];
}

export interface OldTicketTaskEditInput {
  where: WhereService;
  code: string;
  type: string;
  comment: string;
  attachments?: Promise<FileUpload>[];
}

export interface OldTicketTaskNew {
  error?: string;
  where?: WhereService;
  code?: string;
  name?: string;
  requisiteSource?: string;
  category?: string;
  organization?: string;
  status?: string;
  createdDate?: Date;
}

export interface OSTicketUser {
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
