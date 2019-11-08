/** @format */

// #region Imports NPM
// eslint-disable-next-line import/named
import { WithTranslation } from 'react-i18next';
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
  | 'disabled';

export interface Column {
  name: ColumnNames;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface ProfileProps extends WithTranslation {
  profileId: string | boolean;
  handleClose(): void;
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
}
