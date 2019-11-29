/** @format */

// #region Imports NPM
import { WithTranslation } from 'next-i18next';
import { Order } from 'typeorm-graphql-pagination';
import { TFunction } from 'i18next';
// #endregion
// #region Imports Local
// #endregion

export type ColumnNames =
  | 'lastName'
  | 'nameEng'
  | 'username'
  | 'thumbnailPhoto'
  | 'thumbnailPhoto40'
  | 'company'
  | 'companyEng'
  | 'department'
  | 'departmentEng'
  | 'otdel'
  | 'otdelEng'
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

interface StyleProps {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}
export interface Column {
  name: ColumnNames;
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
}

export interface HeaderProps {
  columns: ColumnNames[];
  orderBy: Order<ColumnNames>;
  handleRequestSort: (column: ColumnNames) => () => void;
  classes: any;
  t: TFunction;
  largeWidth: boolean;
}
