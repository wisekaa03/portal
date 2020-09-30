/** @format */
import type { FileUpload } from 'graphql-upload';
import type { GraphQLMutationInput, GraphQLQueryInput } from '@back/shared/types';

export enum TkWhere {
  SOAP1C = 'SOAP1C',
  OSTaudit = 'OSTaudit',
  OSTmedia = 'OSTmedia',
  OSThr = 'OSThr',
  Default = 'default',
}

export interface TkService {
  id: string;
  where: TkWhere;
  code: string;
  name: string;
  description: string | null;
  route: string | null;
  avatar: string | null;
}

export interface TkRoute {
  id: string;
  where: TkWhere;
  code: string;
  name: string;
  description: string | null;
  avatar: string | null;
  services: TkService[] | null;
}

export interface TkRoutes {
  routes: TkRoute[] | null;
  errors: string[] | null;
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
  id: string;
  where: TkWhere;
  code: string;
  name: string | null;
  mime: string | null;
  body: string | null;
}

export interface TkComment {
  id: string;
  where: TkWhere;
  code: string;
  date: Date | null;
  authorLogin: string | null;
  body: string | null;
  parentCode: string | null;
  files: TkFile[] | null;
}

export interface TkTask {
  id: string;
  where: TkWhere;
  code: string;
  subject: string;
  smallBody: string | null;
  body: string | null;
  status: string;
  route: TkRoute | null;
  service: TkService | null;
  createdDate: Date | null;
  timeoutDate: Date | null;
  endDate: Date | null;
  executorUser: string | null;
  initiatorUser: string | null;
  availableAction: string | null;
  availableStages: string | null;
  files: TkFile[] | null;
  comments: TkComment[] | null;
}

export interface TkUser {
  id: string;
  where: TkWhere;
  code: string;
  name: string;
  login: string | null;
  avatar: string | null;
  email: string | null;
  telephone: string | null;
  company: string | null;
  department: string | null;
  division: string | null;
  manager: string | null;
  title: string | null;
}

export interface TkTasks {
  users: TkUser[] | null;
  tasks: TkTask[] | null;
  errors: string[] | null;
}

export interface TkTaskEditInput extends GraphQLMutationInput {
  where: TkWhere;
  code: string;
  comment: string;
  attachments: Promise<FileUpload>[] | null;
}

export interface TkTaskInput extends GraphQLQueryInput {
  where: TkWhere;
  code: string;
  cache?: boolean;
}

export interface TkCommentInput extends GraphQLMutationInput {
  where: TkWhere;
  code: string;
}

export interface TkFileInput extends GraphQLMutationInput {
  where: TkWhere;
  code: string;
}

export interface TkTaskNewInput extends GraphQLMutationInput {
  where: TkWhere;
  subject: string;
  body: string;
  route: string;
  service: string;
  executorUser: string | null;
  attachments: Promise<FileUpload>[] | null;
}

export interface TkTaskNew {
  where: TkWhere;
  code: string;
  subject: string;
  route: string | null;
  service: string;
  organization: string | null;
  status: string | null;
  createdDate: Date;
}

export interface TkEditTask {
  users: TkUser[] | null;
  task: TkTask | null;
  errors: string[] | null;
}
