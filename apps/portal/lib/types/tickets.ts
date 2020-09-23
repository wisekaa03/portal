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
  description?: string;
  route?: string;
  avatar?: string;
}

export interface TkRoute {
  id: string;
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
  id: string;
  where: TkWhere;
  code: string;
  name?: string;
  mime?: string;
  body?: string;
}

export interface TkComment {
  id: string;
  where: TkWhere;
  code: string;
  date?: Date;
  authorLogin?: string;
  body?: string;
  parentCode?: string;
  files?: TkFile[];
}

export interface TkTask {
  id: string;
  where: TkWhere;
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
  id: string;
  where: TkWhere;
  code: string;
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

export interface TkTaskEditInput extends GraphQLMutationInput {
  where: TkWhere;
  code: string;
  comment: string;
  attachments?: Promise<FileUpload>[];
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

export interface TkEditTask {
  users?: TkUser[];
  task?: TkTask;
  errors?: string[];
}
