/** @format */

// #region Imports NPM
// eslint-disable-next-line import/named
import { WithTranslation } from 'react-i18next';
// #endregion
// #region Imports Local
// import { Profile } from '../../server/profile/models/profile.dto';
// #endregion

export type ColumnNames =
  | 'lastName'
  | 'nameEng'
  | 'login'
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

export type Order = 'ASC' | 'DESC';

export interface Column {
  id: ColumnNames;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left';
  format?: (value: number) => string;
  show?: boolean;
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
