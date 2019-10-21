/** @format */

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

export interface FetchProps {
  birthday: string;
  name: string;
  company: string;
  companyEng: string;
  createdAt: string;
  department: string;
  departmentEng: string;
  firstName: string;
  gender: string;
  id: string;
  lastName: string;
  middleName: string;
  mobile: string;
  nameEng: string;
  otdelEng: string;
  positionEng: string;
  telephone: string;
  thumbnailPhoto: string;
  title: string;
  updatedAt: string;
  workPhone: string;
  addressPersonal: {
    country: string;
    postalCode: string;
    region: string;
    street: string;
  };
}

export interface ProfileProps {
  profile: FetchProps | null;
  handleClose(): void;
}

export interface SettingsProps {
  columns: ColumnNames[];
  handleClose(): void;
  changeColumn(columns: ColumnNames[]): void;
}
