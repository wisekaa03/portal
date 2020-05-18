/** @format */

import { DropzoneFile } from './dropzone';
import { TkService, TkRoutes } from './tickets';

export type ServicesElementType = 'department' | 'service' | 'category';

export interface ServicesRouteProps {
  code: string;
  name: string;
  avatar?: any;
}

export interface ServicesWrapperProps {
  contentRef: React.Ref<any>;
  titleRef: React.Ref<HTMLInputElement>;
  bodyRef: React.Ref<any>;
  currentTab: number;
  task: ServicesTaskProps;
  created: ServicesCreatedProps;
  routes?: TkRoutes[];
  services?: TkService[];
  body: string;
  setBody: React.Dispatch<React.SetStateAction<string>>;
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  loadingRoutes: boolean;
  loadingCreated: boolean;
  refetchRoutes: () => Promise<any>;
  handleCurrentTab: (_: number) => void;
  handleTitle: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  handleResetTicket: () => void;
}

export interface ServicesElementLinkQueryProps {
  route?: string;
  service?: string;
}

export interface ServicesElementProps {
  element: ServicesRouteProps;
  withLink?: boolean;
  active?: string;
  base64?: boolean;
  linkQuery?: ServicesElementLinkQueryProps;
  url?: string;
}

export interface ServicesSuccessProps {
  classes: Record<'root', string>;
  data: ServicesCreatedProps;
}

export interface ServicesSuccessCardProps {
  cardRef: React.Ref<any>;
  classes: Record<'root', string>;
  data: ServicesCreatedProps;
}

export interface TicketsElementProps {
  code: string;
  name: string;
  avatar?: any;
  categoryType?: string;
}

export interface ServicesCreatedProps {
  code?: string;
  name?: string;
  requisiteSource?: string;
  category?: string;
  organization?: string;
  status?: string;
  createdDate?: Date;
}

export interface ServicesTaskProps {
  route?: TicketsElementProps;
  service?: TicketsElementProps;
  title: string;
}
