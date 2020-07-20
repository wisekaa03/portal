/** @format */

//#region Imports NPM
import { WithTranslation } from 'next-i18next';
import { ApolloQueryResult, ApolloError, QueryLazyOptions } from '@apollo/client';
import { Order, Connection } from 'typeorm-graphql-pagination';
import { OutlinedInputProps } from '@material-ui/core';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
//#endregion
//#region Imports Local
import { StyleProps as StyleProperties, Data } from './common';
import { DropzoneFile } from './dropzone';
import { Profile, SearchSuggestions, ProfileInput } from './profile.dto';
import { TkUser, TkTask, TkTasks, TkFileInput, TkFile } from './tickets';
//#endregion

export type ColumnNames =
  | 'lastName'
  | 'nameEng'
  | 'username'
  | 'thumbnailPhoto'
  | 'thumbnailPhoto40'
  | 'company'
  | 'companyEng'
  | 'management'
  | 'managementEng'
  | 'department'
  | 'departmentEng'
  | 'division'
  | 'divisionEng'
  | 'title'
  | 'positionEng'
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
  defaultStyle: StyleProperties;
  largeStyle: StyleProperties;
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
  search: string;
  suggestions: SearchSuggestions[];
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
  style: React.CSSProperties;
}

export interface HeaderProps {
  columns: ColumnNames[];
  orderBy: Order<ColumnNames>;
  handleSort: (column: ColumnNames) => () => void;
  largeWidth: boolean;
}

export interface TableProps {
  hasLoadMore: boolean;
  loadMoreItems: () => Promise<undefined | ApolloQueryResult<Data<'profile', Connection<Profile>>>>;
  columns: ColumnNames[];
  orderBy: Order<ColumnNames>;
  handleSort: (_: ColumnNames) => () => void;
  largeWidth: boolean;
  data: Connection<Profile>;
}

export interface PhonebookProfileControlProps {
  controlEl: HTMLElement | null;
  profileId?: string;
  handleControl: (event: React.MouseEvent<HTMLElement>) => void;
  handleCloseControl: () => void;
}

export interface PhonebookProfileModule<T extends string | number | symbol> {
  profile?: Profile;
  classes: Record<T, string>;
}

export interface PhonebookProfileNameProps extends PhonebookProfileModule<'root'> {
  type: 'firstName' | 'lastName' | 'middleName';
}

export interface PhonebookProfileFieldProps extends PhonebookProfileModule<'root' | 'pointer'> {
  last?: boolean;
  onClick?: (_?: Profile | string) => () => void;
  title: string;
  field:
    | 'company'
    | 'title'
    | 'management'
    | 'department'
    | 'division'
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
  tasks: (TkTask | null)[];
  status: string;
  search: string;
  refetchTasks: () => Promise<ApolloQueryResult<Data<'TicketsTasks', TkTasks>>>;
  handleSearch: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleStatus: (_: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ProfileTicketsCardProps {
  classes: Record<'root' | 'content' | 'label' | 'registered' | 'worked', string>;
  task: TkTask;
}

export interface ProfileTaskComponentProps {
  loading: boolean;
  loadingEdit: boolean;
  task: TkTask;
  comment: string;
  files: DropzoneFile[];
  setFiles: React.Dispatch<React.SetStateAction<DropzoneFile[]>>;
  taskFile: (options?: QueryLazyOptions<TkFileInput> | undefined) => void;
  taskFileLoading: boolean;
  taskFileData?: Data<'TicketsTaskFile', TkFile>;
  taskFileError?: ApolloError;
  commentFile: (options?: QueryLazyOptions<TkFileInput> | undefined) => void;
  commentFileLoading: boolean;
  commentFileData?: Data<'TicketsCommentFile', TkFile>;
  commentFileError?: ApolloError;
  handleComment: (_: React.ChangeEvent<HTMLInputElement>) => void;
  handleAccept: () => void;
  handleClose: () => void;
}

export interface ProfileTaskInfoCardProps {
  classes: Record<'root' | 'center' | 'content' | 'avatar' | 'list', string>;
  header: string;
  // TODO: !!! STRING THERE !!!
  profile?: TkUser | string;
}

export interface ProfileEditComponentProps {
  isAdmin: boolean;
  newProfile?: boolean;
  loadingCheckUsername?: boolean;
  loadingProfile: boolean;
  loadingChanged: boolean;
  hasUpdate: boolean;
  profile?: Profile | ProfileInput;
  onDrop: (_: any) => Promise<void>;
  handleCheckUsername?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleChange: (
    _: keyof Profile | keyof ProfileInput,
    ___?: string,
  ) => (__: React.ChangeEvent<HTMLInputElement>) => void;
  handleBirthday: (date: MaterialUiPickersDate, value?: string | null | undefined) => void;
  handleSave: () => void;
}

export interface TextFieldComponentProps {
  disabled: boolean;
  handleChange: (_: keyof Profile, ___?: string) => (__: React.ChangeEvent<Record<any, any>>) => void;
  field: keyof Profile;
  value?: any;
  InputProps: Partial<OutlinedInputProps>;
  fullWidth?: boolean;
}
