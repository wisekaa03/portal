/** @format */

// #region Imports NPM
import { ApolloQueryResult } from 'apollo-client';
import { WithTranslation } from 'next-i18next';
import { Order, Connection } from 'typeorm-graphql-pagination';
// #endregion
// #region Imports Local
import { StyleProps, Data } from './common';
import { DropzoneFile } from './dropzone';
import { Profile } from './profile.dto';
import { OldUser, OldTicket, OldTickets } from './old-service';
// #endregion

export type ColumnNames =
  | 'lastName'
  | 'nameeng'
  | 'username'
  | 'thumbnailPhoto'
  | 'thumbnailPhoto40'
  | 'company'
  | 'companyeng'
  | 'department'
  | 'departmenteng'
  | 'otdel'
  | 'otdeleng'
  | 'title'
  | 'positioneng'
  | 'manager'
  | 'room'
  | 'telephone'
  | 'fax'
  | 'mobile'
  | 'workPhone'
  | 'email'
  | 'country'
  | 'region'
  | 'town'
  | 'street'
  | 'disabled'
  | 'notShowing';

export interface Column {
  name: ColumnNames;
  admin: boolean;
  defaultStyle: StyleProps;
  largeStyle: StyleProps;
}

export interface ProfileQueryProps {
  first: number;
  after: string;
  orderBy: Order<ColumnNames>;
  search: string;
  disabled: boolean;
  notShowing: boolean;
}

export interface PhonebookSearchProps {
  searchRef: React.MutableRefObject<HTMLInputElement>;
  search: string;
  suggestions: string[];
  refetch: (variables?: ProfileQueryProps) => Promise<ApolloQueryResult<Data<'profiles', Connection<Profile>>>>;
  handleSearch: React.ChangeEventHandler<HTMLInputElement>;
  handleSugClose: (_: React.MouseEvent<EventTarget>) => void;
  handleSugKeyDown: (_: React.KeyboardEvent) => void;
  handleSugClick: (_: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
  handleHelpOpen: () => void;
  handleSettingsOpen: () => void;
}

export interface ProfileProps extends WithTranslation {
  profileId: string;
  handleClose(): void;
  handleSearch(text: string): void;
}

export interface SettingsProps extends WithTranslation {
  columns: ColumnNames[];
  handleClose: () => void;
  handleReset: () => void;
  changeColumn(columns: ColumnNames[]): void;
  isAdmin: boolean;
}

export interface PhonebookHelpProps extends WithTranslation {
  onClose: () => void;
}

export interface HeaderPropsRef {
  style: any;
}

export interface HeaderProps {
  columns: ColumnNames[];
  orderBy: Order<ColumnNames>;
  handleSort: (column: ColumnNames) => () => void;
  largeWidth: boolean;
}

export interface TableProps {
  hasLoadMore: boolean;
  loadMoreItems: () => any;
  columns: ColumnNames[];
  orderBy: Order<ColumnNames>;
  handleSort: (_: ColumnNames) => () => void;
  largeWidth: boolean;
  // TODO: вписать нормальный тип
  data: any;
}

export interface PhonebookProfileControlProps {
  controlEl: HTMLElement | null;
  profileId: string;
  handleControl: (event: React.MouseEvent<HTMLElement>) => void;
  handleCloseControl: () => void;
}

export interface PhonebookProfileModule<T extends string | number | symbol> {
  profile: Profile;
  classes: Record<T, string>;
}

export interface PhonebookProfileNameProps extends PhonebookProfileModule<'root'> {
  type: 'firstName' | 'lastName' | 'middleName';
}

export interface PhonebookProfileFieldProps extends PhonebookProfileModule<'root' | 'pointer'> {
  last?: boolean;
  onClick?: (_: Profile | string | undefined) => () => void;
  title: string;
  field:
    | 'department'
    | 'company'
    | 'title'
    | 'otdel'
    | 'manager'
    | 'country'
    | 'region'
    | 'town'
    | 'street'
    | 'postalCode';
}

export interface HelpDataProps {
  id: number;
  image: any;
  text: React.ReactNode;
}

export interface ProfileTicketsComponentProps {
  loading: boolean;
  tickets: OldTicket[];
  status: string;
  search: string;
  refetchTickets: () => Promise<ApolloQueryResult<Data<'OldTickets', OldTickets[]>>>;
  handleSearch: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatus: (_: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ProfileTicketsCardProps {
  classes: Record<'root' | 'content' | 'label' | 'registered' | 'worked', string>;
  ticket: OldTicket;
}

export interface ProfileTicketComponentProps {
  loading: boolean;
  loadingEdit: boolean;
  ticket: OldTicket;
  comment: string;
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  handleComment: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleAccept: () => void;
  handleClose: () => void;
}

export interface ProfileTicketInfoCardProps {
  classes: Record<'root' | 'center' | 'content' | 'avatar' | 'list', string>;
  header: string;
  profile: OldUser;
}

export interface ProfileEditComponentProps {
  isAdmin: boolean;
  loadingProfile: boolean;
  loadingChanged: boolean;
  hasUpdate: boolean;
  profile?: Profile;
  onDrop: (_: any) => Promise<void>;
  handleChange: (_: keyof Profile, ___?: string) => (__: React.ChangeEvent<HTMLInputElement>) => void;
  handleBirthday: (_: Date | null) => void;
  handleSave: () => void;
}

export interface TextFieldComponentProps {
  disabled: boolean;
  handleChange: (_: keyof Profile, ___?: string) => (__: React.ChangeEvent<HTMLInputElement>) => void;
  field: keyof Profile;
  value?: any;
  department?: string;
  InputProps: any;
}
