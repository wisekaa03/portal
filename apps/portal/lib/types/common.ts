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

export interface DataResultReturn<K> {
  return?: K;
}

export interface DataResultSOAP<K> {
  0?: DataResultReturn<K>;
}
