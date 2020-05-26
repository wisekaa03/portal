/** @format */

import { ApolloError } from 'apollo-client';
import { DropzoneFile } from './dropzone';
import { TkRoutes, TkRoute, TkService } from './tickets';
import { UserSettingsTaskFavorite } from './user.dto';

export interface ServicesWrapperProps {
  contentRef: React.Ref<any>;
  serviceRef: React.Ref<HTMLSelectElement>;
  bodyRef: React.Ref<any>;
  currentTab: number;
  task: ServicesTaskProps;
  created: ServicesCreatedProps;
  errorCreated: ApolloError;
  routes?: TkRoutes[];
  favorites: UserSettingsTaskFavorite[] | null;
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
  id: string;
  where: string;
  action: 'up' | 'down' | 'add' | 'delete';
};

export interface ServicesElementProps {
  element: TaskElementProps;
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

export interface TaskElementProps {
  where: string;
  code: string;
  name: string;
  avatar?: any;
  description?: string;
  priority?: number;
}

export interface ServicesCreatedProps {
  code?: string;
  name?: string;
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
