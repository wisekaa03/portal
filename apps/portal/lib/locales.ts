/** @format */

import type { Locale } from 'date-fns';
import { enUS as en, ru } from 'date-fns/locale';

export interface PortalLocales {
  en: Locale;
  ru: Locale;
}

export const localesDate: PortalLocales = {
  en,
  ru,
};

export const dateLocale = (language?: string): Locale => {
  switch (language) {
    case 'en':
      return localesDate.en;
    default:
      return localesDate.ru;
  }
};
