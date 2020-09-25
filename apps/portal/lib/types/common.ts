/** @format */

export const SOAP_DATE_NULL = '0000-12-31T21:29:43.000Z';

export interface StyleProps {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export type Data<K extends string, V> = {
  [P in K]: V;
};

export interface DataReturn<K> {
  return: K;
}

export interface DataItems<K> {
  items: K;
}

export interface DataUser<K> {
  user: K;
}

export interface DataFiles<K> {
  files: K;
}

export interface DataResult<K> {
  0?: DataReturn<K>;
}
