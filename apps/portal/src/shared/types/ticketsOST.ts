/** @format */

export interface TkUserOST {
  company: string;
  currentCount: string;
  email: string;
  fio: string;
  function: string;
  manager: string;
  phone: string;
  // eslint-disable-next-line camelcase
  phone_ext: string;
  subdivision: string;
  Аватар: string;
}

export type RecordsOST = Record<string, Array<Record<string, Record<string, any>>>>;
