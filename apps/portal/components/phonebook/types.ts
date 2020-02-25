/** @format */

// #region Imports NPM
import { WithTranslation } from 'next-i18next';
import { Order } from 'typeorm-graphql-pagination';
// #endregion
// #region Imports Local
import { Profile } from '@app/portal/profile/models/profile.dto';
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

interface StyleProps {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}
export interface Column {
  name: ColumnNames;
  admin: boolean;
  defaultStyle: StyleProps;
  largeStyle: StyleProps;
}

export interface ProfileProps extends WithTranslation {
  profileId: string | false;
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

export interface HeaderPropsRef {
  style: any;
}

export interface HeaderProps {
  columns: ColumnNames[];
  orderBy: Order<ColumnNames>;
  handleSort: (column: ColumnNames) => () => void;
  largeWidth: boolean;
}

export interface PhonebookControlProps {
  searchRef: React.MutableRefObject<HTMLInputElement>;
  search: string;
  suggestions: string[];
  // TODO: вписать нормальный тип
  refetch: any;
  handleSearch: React.ChangeEventHandler<HTMLInputElement>;
  handleSugClose: (_: React.MouseEvent<EventTarget>) => void;
  handleSugKeyDown: (_: React.KeyboardEvent) => void;
  handleSugClick: (_: string) => () => void;
  handleSettingsOpen: () => void;
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
