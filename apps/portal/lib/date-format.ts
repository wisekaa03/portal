/** @format */
/* eslint import/no-duplicates: 0 */

//#region Imports NPM
import { format as dateFnsFormat } from 'date-fns';
import { i18n } from 'i18next';
//#endregion
//#region Imports Local
import { localesDate, PortalLocales } from './locales';
//#endregion

// @todo: разобраться с локалями
export const dateFormat = (date: Date | number | null | undefined, formatStr: i18n, formatIfNull = '<Дата не установлена>'): string => {
  const { language } = formatStr;
  return !date
    ? formatIfNull
    : dateFnsFormat(date, language === 'ru' ? 'PPpp' : 'PPpp', { locale: localesDate[language as keyof PortalLocales] });
};

export default dateFormat;
