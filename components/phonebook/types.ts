/** @format */

// #region Imports NPM
// #endregion
// #region Imports Local
import { Profile } from '../../server/profile/models/profile.dto';
// #endregion

export type ColumnNames =
  | 'name'
  | 'nameEng'
  | 'login'
  | 'thumbnailPhoto'
  | 'company'
  | 'companyEng'
  | 'department'
  | 'departmentEng'
  | 'otdel'
  | 'otdelEng'
  | 'title'
  | 'positionEng'
  | 'supervisor'
  | 'room'
  | 'telephone'
  | 'fax'
  | 'mobile'
  | 'workPhone'
  | 'email'
  | 'country'
  | 'region'
  | 'city'
  | 'address';

export type Order = 'asc' | 'desc';

export interface Column {
  id: ColumnNames;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left';
  format?: (value: number) => string;
  show?: boolean;
}

export interface ProfileProps {
  profileId: string | boolean;
  handleClose(): void;
}

export interface SettingsProps {
  columns: ColumnNames[];
  handleClose(): void;
  changeColumn(columns: ColumnNames[]): void;
}
