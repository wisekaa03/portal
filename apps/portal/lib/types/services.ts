/** @format */

import type React from 'react';
import type { ApolloError } from '@apollo/client';
import type { DropzoneFile } from './dropzone';
import type { TkRoute, TkService } from './tickets';
import type { UserSettingsTaskFavorite, UserSettingsTaskFavoriteFull } from './user.dto';

export interface ServicesTaskProps {
  route?: TkRoute;
  service?: TkService;
}

export interface ServicesCreatedProps {
  code?: string | null;
  subject?: string | null;
  organization?: string | null;
  status?: string | null;
  createdDate?: Date | null;
  route?: string | null;
  service?: string | null;
}

export interface TicketsWrapperProps {
  contentRef: React.Ref<any>;
  serviceRef: React.Ref<HTMLSelectElement>;
  subjectRef: React.Ref<HTMLInputElement>;
  bodyRef: React.Ref<HTMLTextAreaElement>;
  currentTab: number;
  task: ServicesTaskProps;
  created: ServicesCreatedProps;
  errorCreated?: ApolloError;
  routes?: (TkRoute | null)[];
  favorites: UserSettingsTaskFavoriteFull[];
  subject: string;
  setSubject: React.Dispatch<React.SetStateAction<string>>;
  body: string;
  setBody: React.Dispatch<React.SetStateAction<string>>;
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  submitted: boolean;
  loadingSettings: boolean;
  loadingRoutes: boolean;
  loadingCreated: boolean;
  handleCurrentTab: (_: number) => void;
  handleService: (_: React.ChangeEvent<HTMLSelectElement>) => void;
  handleSubmit: () => void;
  handleResetTicket: () => void;
  handleFavorites: (_: UserSettingsTaskFavorite[]) => void;
}

export type ServicesFavoriteProps = {
  favorite: UserSettingsTaskFavorite;
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
  loadingSettings: boolean;
  favorite: UserSettingsTaskFavoriteFull;
  withLink?: boolean;
  active?: boolean;
  base64?: boolean;
  url?: string;
  setFavorite?: (_: ServicesFavoriteProps) => void;
  isUp?: boolean;
  isDown?: boolean;
}

export interface ServicesSuccessProps {
  data: ServicesCreatedProps;
  onClose: () => void;
}

export interface ServicesErrorProps {
  error: ApolloError | string;
  onClose: () => void;
}

export interface ServicesSuccessCardProps {
  data: ServicesCreatedProps;
}
