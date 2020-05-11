/** @format */

import { DropzoneFile } from './dropzone';
import { OldService } from './old-service';

export type ServicesElementType = 'department' | 'service' | 'category';

export interface ServicesDepartmentsProps {
  code: string;
  name: string;
  avatar: any;
}

export interface ServicesWrapperProps {
  contentRef: React.Ref<any>;
  titleRef: React.Ref<HTMLInputElement>;
  bodyRef: React.Ref<any>;
  currentTab: number;
  ticket: ServicesTicketProps;
  created: ServicesCreatedProps;
  departments: ServicesDepartmentsProps[];
  services: OldService[];
  body: string;
  setBody: React.Dispatch<React.SetStateAction<string>>;
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  loadingServices: boolean;
  loadingCreated: boolean;
  refetchServices: () => Promise<any>;
  handleCurrentTab: (_: number) => void;
  handleTitle: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  handleResetTicket: () => void;
}

export interface ServicesElementLinkQueryProps {
  department: string;
  service?: string;
  category?: string;
}

export interface ServicesElementProps {
  element: ServicesDepartmentsProps;
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

export interface ServicesTicketElementProps {
  code: string;
  name: string;
  avatar: any;
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

export interface ServicesTicketProps {
  department?: ServicesTicketElementProps;
  service?: ServicesTicketElementProps;
  category?: ServicesTicketElementProps;
  title: string;
}
