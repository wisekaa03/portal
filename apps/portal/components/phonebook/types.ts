/** @format */

// #region Imports NPM
import { WithTranslation } from 'next-i18next';
import { Order } from 'typeorm-graphql-pagination';
// #endregion
// #region Imports Local
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
  handleClose(): void;
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
  handleProfileId: (_: string | undefined) => () => void;
}
