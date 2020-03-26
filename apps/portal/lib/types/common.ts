/** @format */

export interface StyleProps {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface Data<K, T> {
  [K: string]: T;
}
