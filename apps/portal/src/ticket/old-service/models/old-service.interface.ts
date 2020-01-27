/** @format */
import { FileUpload } from 'graphql-upload';

export interface OldCategory {
  code: string;
  name: string;
  description: string;
  categoryType: string;
  avatar: string;
}

export interface OldService {
  code: string;
  name: string;
  group: string;
  description: string;
  avatar: string;
  category: OldCategory[];
}

export interface OldTicketNewInput {
  title: string;
  body: string;
  serviceId: string;
  categoryId: string;
  categoryType: string;
  executorUser?: string;
  attachments?: FileUpload;
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
