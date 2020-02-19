/** @format */

// TODO: сделать определение формата даты с региональных настроек

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { I18n } from 'next-i18next';

const DATE_FORMAT = (i: I18n): string => (i.language !== 'ru' ? 'YYYY-MM-DD HH:mm' : 'DD.MM.YYYY г. HH:mm');

dayjs.locale('ru');

export const format = (date: string | Date, i: I18n | string): string =>
  dayjs(date).format(typeof i === 'string' ? i : DATE_FORMAT(i));

export default dayjs;
