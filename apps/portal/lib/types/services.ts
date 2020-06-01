/** @format */

import { ApolloError } from 'apollo-client';
import { Component } from 'react';
import { DropzoneFile } from './dropzone';
import { TkRoutes, TkRoute, TkService } from './tickets';
import { UserSettingsTaskFavorite } from './user.dto';

export interface ServicesWrapperProps {
  contentRef: React.Ref<any>;
  serviceRef: React.Ref<HTMLSelectElement>;
  subjectRef: React.Ref<HTMLInputElement>;
  bodyRef: React.Ref<Component<Record<string, any>, Record<string, any>, any>>;
  currentTab: number;
  task: ServicesTaskProps;
  created: ServicesCreatedProps;
  errorCreated: ApolloError;
  routes?: TkRoute[];
  favorites: UserSettingsTaskFavorite[] | null;
  subject: string;
  setSubject: React.Dispatch<React.SetStateAction<string>>;
  body: string;
  setBody: React.Dispatch<React.SetStateAction<string>>;
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  submitted: boolean;
  loadingRoutes: boolean;
  loadingCreated: boolean;
  refetchRoutes: () => Promise<any>;
  handleCurrentTab: (_: number) => void;
  handleService: (_: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSubmit: () => void;
  handleResetTicket: () => void;
  handleFavorites: (_: UserSettingsTaskFavorite[]) => void;
}

export type ServicesFavoriteProps = {
  route: UserSettingsTaskFavorite;
  action: 'up' | 'down' | 'add' | 'delete';
};

export interface ServicesElementProps {
  route: TkRoute;
  withLink?: boolean;
  active?: boolean;
  base64?: boolean;
  url?: string;
}

export interface ServicesElementFavProps {
  route: UserSettingsTaskFavorite;
  withLink?: boolean;
  active?: boolean;
  base64?: boolean;
  url?: string;
  favorite?: boolean;
  setFavorite?: (_: ServicesFavoriteProps) => void;
  isUp?: boolean;
  isDown?: boolean;
}

export interface ServicesSuccessProps {
  classes: Record<'root' | 'actions', string>;
  data: ServicesCreatedProps;
  onClose: () => void;
}

export interface ServicesErrorProps {
  error: ApolloError | string;
  onClose: () => void;
}

export interface ServicesSuccessCardProps {
  cardRef: React.Ref<any>;
  classes: Record<'root' | 'title', string>;
  data: ServicesCreatedProps;
}

export interface ServicesCreatedProps {
  code?: string;
  subject?: string;
  organization?: string;
  status?: string;
  createdDate?: Date;
  route?: string;
  service?: string;
}

export interface ServicesTaskProps {
  route?: TkRoute;
  service?: TkService;
}
