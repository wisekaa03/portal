/** @format */
/* eslint import/no-duplicates: 0 */

//#region Imports NPM
import { format as dateFnsFormat } from 'date-fns';
import { enUS as en, ru } from 'date-fns/locale';
import { I18n } from 'next-i18next';
//#endregion
//#region Imports Local
//#endregion

const locales = { en, ru };

export const dateFormat = (date: Date | number | null | undefined, formatStr: I18n): string =>
  !date ? '' : dateFnsFormat(date, formatStr.language === 'ru' ? 'PPpp' : 'PPpp', { locale: locales[formatStr.language] });

export default dateFormat;
