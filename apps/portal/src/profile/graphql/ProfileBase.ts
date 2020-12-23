/** @format */

import type { Gender } from '@back/shared/graphql';

export interface ProfileBase {
  id?: string;

  disabled?: boolean;
  notShowing?: boolean;

  username?: string;

  firstName?: string;
  lastName?: string;
  middleName?: string;

  email?: string;
  birthday?: Date | null;
  gender?: Gender;

  country?: string;
  postalCode?: string;
  region?: string;
  city?: string;
  street?: string;
  room?: string;
  addressPersonal?: string;

  company?: string;
  management?: string;
  department?: string;
  division?: string;
  title?: string;

  telephone?: string;
  workPhone?: string;
  mobile?: string;
  fax?: string;

  employeeID?: string;
  accessCard?: string;

  companyEng?: string;
  nameEng?: string;
  managementEng?: string;
  departmentEng?: string;
  divisionEng?: string;
  titleEng?: string;
}
