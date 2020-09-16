/** @format */

export const SOAP_DATE_NULL = '0000-12-31T21:29:43.000Z';

export interface StyleProps {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface Data<K, T> {
  [K: string]: T;
}

interface DataResultReturn<K> {
  return?: K;
}

export interface DataResultSOAP<K> {
  0?: DataResultReturn<K>;
}
