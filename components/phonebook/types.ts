/** @format */

export type ColumnNames =
  | 'name'
  | 'name_en'
  | 'login'
  | 'photo'
  | 'company'
  | 'company_en'
  | 'department'
  | 'department_en'
  | 'division'
  | 'division_en'
  | 'position'
  | 'position_en'
  | 'supervisor'
  | 'room'
  | 'telephone'
  | 'fax'
  | 'mobile_phone'
  | 'inside_phone'
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

export interface BookProps {
  id: number;
  name: string;
  name_en: string;
  login: string;
  photo: string;
  company: string;
  company_en: string;
  department: string;
  department_en: string;
  division: string;
  division_en: string;
  position: string;
  position_en: string;
  supervisor: string;
  room: string;
  telephone: string;
  fax: string;
  mobile_phone: string;
  inside_phone: string;
  email: string;
  country: string;
  region: string;
  city: string;
  address: string;
}

export interface ProfileProps {
  profile: BookProps | null;
  handleClose(): void;
}

export interface SettingsProps {
  columns: ColumnNames[];
  handleClose(): void;
  changeColumn(columns: ColumnNames[]): void;
}
