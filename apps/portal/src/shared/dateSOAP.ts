/** @format */

import { SOAP_DATE_NULL } from './constants';

export function dateSOAP(value?: Date | string): Date | undefined {
  if (typeof value === 'undefined') {
    return undefined;
  }
  if (typeof value === 'string') {
    const valueDate = new Date(value);
    return valueDate.toISOString() === SOAP_DATE_NULL ? undefined : valueDate;
  }
  return value.toISOString() === SOAP_DATE_NULL ? undefined : value;
}
