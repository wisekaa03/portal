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
  group?: string;
  description?: string;
  avatar: string;
}

export interface OldServices {
  services?: OldService[];
  error?: string;
}

export interface OldFile {
  code: string;
  name: string;
  ext: string;
}

export interface OldTicket {
  where: WhereService;
  code: string;
  name: string;
  type?: string;
  description: string;
  descriptionFull?: string;
  status: string;
  createdDate: string;
  avatar?: string;
  timeout?: string;
  endDate?: string;
  executorUser?: OldUser | null;
  initiatorUser?: OldUser | null;
  service?: OldService;
  files?: OldFile[];
}

export interface OldTickets {
  tickets?: OldTicket[];
  error?: string;
}

export interface OldUser {
  name: string;
  avatar?: string;
  email?: string;
  telephone?: string;
  company?: string;
  department?: string;
  otdel?: string;
  position?: string;
}

export interface OldTicketNewInput {
  title: string;
  body: string;
  serviceId: string;
  categoryId: string;
  categoryType: string;
  executorUser?: string;
  attachments?: Promise<FileUpload>[];
}

export interface OldTicketEditInput {
  code: string;
  type: string;
  comment: string;
  attachments?: Promise<FileUpload>[];
}

export interface OldTicketNew {
  code: string;
  name: string;
  requisiteSource: string;
  category: string;
  organization: string;
  status: string;
  createdDate: Date;
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
