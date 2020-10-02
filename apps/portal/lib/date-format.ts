/** @format */
/* eslint import/no-duplicates: 0 */

//#region Imports NPM
import { format as dateFnsFormat } from 'date-fns';
import { enUS as en, ru } from 'date-fns/locale';
import { i18n } from 'i18next';
//#endregion
//#region Imports Local
//#endregion

const locales = { en, ru };

// TODO: разобраться с локалями
export const dateFormat = (date: Date | number | null | undefined, formatStr: i18n, formatIfNull = '<Дата не установлена>'): string =>
  !date ? formatIfNull : dateFnsFormat(date, formatStr.language === 'ru' ? 'PPpp' : 'PPpp', { locale: locales[formatStr.language] });

export default dateFormat;
