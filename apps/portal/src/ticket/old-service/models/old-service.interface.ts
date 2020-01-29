/** @format */
import { FileUpload } from 'graphql-upload';

export interface OldCategory {
  code: string;
  name: string;
  description?: string;
  categoryType?: string;
  avatar: string;
}

export interface OldService {
  code: string;
  name: string;
  group?: string;
  description?: string;
  avatar: string;
  category?: OldCategory[];
}

export interface OldFile {
  code: string;
  name: string;
  ext: string;
}

export interface OldTicket {
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
  serviceCategory?: OldCategory;
  files?: OldFile[];
}

export interface OldUser {
  name: string;
  avatar: string;
  email: string;
  telephone: string;
  company: string;
  department: string;
  otdel: string;
  position: string;
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

export interface OldTicketNew {
  code: string;
  name: string;
  requisiteSource: string;
  category: string;
  organization: string;
  status: string;
  createdDate: Date;
}
